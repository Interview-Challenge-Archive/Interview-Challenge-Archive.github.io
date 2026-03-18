import { computed, ref } from 'vue'
import { Octokit } from '@octokit/rest'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useSessionStore } from 'src/stores/session-store'

const SUBMISSION_MARKER_PATH = '.github/ica-submission.yml'
const SUBMISSION_BOT_LOGIN = 'InterviewChallengeArchive[bot]'
const REPOSITORY_PAGE_SIZE = 100
const PULL_REQUEST_PAGE_SIZE = 100
const REPOSITORY_SCAN_CONCURRENCY = 4

export const useGitHubSubmissionsStore = defineStore('github-submissions', () => {
  const sessionStore = useSessionStore()
  const submissions = ref([])
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const errorMessageKey = ref('')
  const loadedAccessToken = ref('')

  const githubAccessToken = computed(() => sessionStore.getActiveAccessToken('github'))

  function reset () {
    submissions.value = []
    isLoading.value = false
    hasLoaded.value = false
    errorMessageKey.value = ''
    loadedAccessToken.value = ''
  }

  async function refreshSubmissions () {
    return loadSubmissions({ force: true })
  }

  async function loadSubmissions ({ force = false } = {}) {
    const accessToken = githubAccessToken.value

    if (!accessToken) {
      reset()
      return []
    }

    if (isLoading.value) {
      return submissions.value
    }

    if (!force && hasLoaded.value && loadedAccessToken.value === accessToken) {
      return submissions.value
    }

    isLoading.value = true
    errorMessageKey.value = ''

    try {
      const octokit = new Octokit({ auth: accessToken })
      const authenticatedUserResponse = await octokit.rest.users.getAuthenticated()
      const normalizedViewerLogin = String(authenticatedUserResponse.data?.login ?? '').trim().toLowerCase()
      const repositories = await octokit.paginate(
        octokit.rest.repos.listForAuthenticatedUser,
        {
          visibility: 'public',
          affiliation: 'owner',
          sort: 'updated',
          direction: 'desc',
          per_page: REPOSITORY_PAGE_SIZE
        }
      )
      const viewerRepositories = repositories.filter((repository) =>
        repository?.name
        && !repository.fork
        && !repository.disabled
        && String(repository?.owner?.login ?? '').trim().toLowerCase() === normalizedViewerLogin
      )
      const discoveredSubmissions = []

      await mapWithConcurrency(
        viewerRepositories,
        REPOSITORY_SCAN_CONCURRENCY,
        async (repository) => {
          const owner = String(repository?.owner?.login ?? '').trim()
          const name = String(repository?.name ?? '').trim()

          if (!owner || !name) {
            return
          }

          const hasSubmissionFile = await repositoryHasSubmissionFile(octokit, owner, name)
          const pullRequest = await fetchSubmissionPullRequest(octokit, owner, name)

          if (!hasSubmissionFile && !pullRequest) {
            return
          }

          discoveredSubmissions.push({
            owner,
            repository: name,
            repoFullName: repository.full_name || `${owner}/${name}`,
            repoUrl: repository.html_url || `https://github.com/${owner}/${name}`,
            pullRequestUrl: pullRequest?.url ?? '',
            pullRequestNumber: pullRequest?.number ?? null,
            updatedAt: repository.updated_at ?? ''
          })
        }
      )

      submissions.value = discoveredSubmissions.sort(sortSubmissionsByUpdatedAt)
      hasLoaded.value = true
      loadedAccessToken.value = accessToken
      return submissions.value
    } catch (error) {
      submissions.value = []
      hasLoaded.value = true
      errorMessageKey.value = resolveErrorMessageKey(error)
      return submissions.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    submissions,
    isLoading,
    hasLoaded,
    errorMessageKey,
    reset,
    loadSubmissions,
    refreshSubmissions
  }
}, {
  persist: false
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGitHubSubmissionsStore, import.meta.hot))
}

async function repositoryHasSubmissionFile (octokit, owner, repository) {
  try {
    await octokit.rest.repos.getContent({
      owner,
      repo: repository,
      path: SUBMISSION_MARKER_PATH
    })

    return true
  } catch (error) {
    if (isSkippableLookupError(error)) {
      return false
    }

    throw error
  }
}

async function fetchSubmissionPullRequest (octokit, owner, repository) {
  try {
    const pullRequests = await octokit.paginate(
      octokit.rest.pulls.list,
      {
        owner,
        repo: repository,
        state: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: PULL_REQUEST_PAGE_SIZE
      }
    )
    const botPullRequest = pullRequests.find((pullRequest) => pullRequest?.user?.login === SUBMISSION_BOT_LOGIN)

    if (!botPullRequest) {
      return null
    }

    return {
      number: botPullRequest.number,
      url: botPullRequest.html_url ?? ''
    }
  } catch (error) {
    if (isSkippableLookupError(error)) {
      return null
    }

    throw error
  }
}

function isSkippableLookupError (error) {
  const status = Number(error?.status ?? error?.response?.status)

  return status === 404 || status === 409
}

function sortSubmissionsByUpdatedAt (left, right) {
  const leftTimestamp = Date.parse(left.updatedAt)
  const rightTimestamp = Date.parse(right.updatedAt)

  if (Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp)) {
    return rightTimestamp - leftTimestamp
  }

  return left.repoFullName.localeCompare(right.repoFullName)
}

function resolveErrorMessageKey (error) {
  const status = Number(error?.status ?? error?.response?.status)

  if (status === 403 || status === 429) {
    return 'dock.submissions.errors.rateLimited'
  }

  return 'dock.submissions.errors.loadFailed'
}

async function mapWithConcurrency (items, concurrency, task) {
  if (!Array.isArray(items) || !items.length) {
    return
  }

  const safeConcurrency = Math.max(1, Math.trunc(concurrency))
  let cursor = 0
  const workers = Array.from({ length: Math.min(safeConcurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const currentIndex = cursor
      cursor += 1
      await task(items[currentIndex], currentIndex)
    }
  })

  await Promise.all(workers)
}
