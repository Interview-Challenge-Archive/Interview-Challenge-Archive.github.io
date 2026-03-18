import { computed, ref } from 'vue'
import { Octokit } from '@octokit/rest'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useSessionStore } from 'src/stores/session-store'
import githubApiConfig from 'src/config/github_api.yml'

const SUBMISSION_MARKER_PATH = '.github/ica-submission.yml'
const SUBMISSION_BOT_LOGIN = 'InterviewChallengeArchive[bot]'
const REPOSITORY_PAGE_SIZE = githubApiConfig.submissions.repositoryPageSize
const CODE_SEARCH_PAGE_SIZE = githubApiConfig.submissions.codeSearchPageSize
const PULL_REQUEST_SEARCH_PAGE_SIZE = githubApiConfig.submissions.pullRequestSearchPageSize
const REPOSITORY_SCAN_CONCURRENCY = githubApiConfig.submissions.repositoryScanConcurrency

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
      const repositoriesWithSubmissionFile = await searchRepositoriesWithSubmissionFile(
        octokit,
        normalizedViewerLogin
      )
      const submissionPullRequestsByRepository = await searchSubmissionPullRequestsByRepository(
        octokit,
        normalizedViewerLogin
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

          const normalizedRepoFullName = String(repository.full_name || `${owner}/${name}`)
            .trim()
            .toLowerCase()
          const hasSubmissionFile = repositoriesWithSubmissionFile
            ? repositoriesWithSubmissionFile.has(normalizedRepoFullName)
            : await repositoryHasSubmissionFile(octokit, owner, name)
          const pullRequest = submissionPullRequestsByRepository
            ? (submissionPullRequestsByRepository.get(normalizedRepoFullName) ?? null)
            : await fetchSubmissionPullRequest(octokit, owner, name)

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

async function searchRepositoriesWithSubmissionFile (octokit, viewerLogin) {
  const normalizedViewerLogin = String(viewerLogin ?? '').trim()

  if (!normalizedViewerLogin) {
    return new Set()
  }

  try {
    const [submissionDirectory, submissionFileName] = SUBMISSION_MARKER_PATH.split('/')
    const searchResults = await octokit.paginate(
      octokit.rest.search.code,
      {
        q: [
          `user:${normalizedViewerLogin}`,
          `path:${submissionDirectory}`,
          `filename:${submissionFileName}`
        ].join(' '),
        per_page: CODE_SEARCH_PAGE_SIZE
      }
    )

    return new Set(searchResults
      .map((item) => String(item?.repository?.full_name ?? '').trim().toLowerCase())
      .filter(Boolean))
  } catch (error) {
    if (isSearchQueryValidationError(error)) {
      return null
    }

    throw error
  }
}

async function searchSubmissionPullRequestsByRepository (octokit, viewerLogin) {
  const normalizedViewerLogin = String(viewerLogin ?? '').trim()

  if (!normalizedViewerLogin) {
    return new Map()
  }

  let searchResults = []

  try {
    searchResults = await octokit.paginate(
      octokit.rest.search.issuesAndPullRequests,
      {
        q: [
          `user:${normalizedViewerLogin}`,
          'is:pr'
        ].join(' '),
        sort: 'updated',
        order: 'desc',
        per_page: PULL_REQUEST_SEARCH_PAGE_SIZE
      }
    )
  } catch (error) {
    if (isSearchQueryValidationError(error)) {
      return null
    }

    throw error
  }

  const pullRequestsByRepository = new Map()

  for (const searchResult of searchResults) {
    if (String(searchResult?.user?.login ?? '').trim() !== SUBMISSION_BOT_LOGIN) {
      continue
    }

    const repositoryFullName = extractRepositoryFullName(searchResult)

    if (!repositoryFullName || pullRequestsByRepository.has(repositoryFullName)) {
      continue
    }

    pullRequestsByRepository.set(repositoryFullName, {
      number: Number(searchResult?.number) || null,
      url: String(searchResult?.pull_request?.html_url ?? searchResult?.html_url ?? '').trim()
    })
  }

  return pullRequestsByRepository
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
        per_page: PULL_REQUEST_SEARCH_PAGE_SIZE
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

function isSearchQueryValidationError (error) {
  const status = Number(error?.status ?? error?.response?.status)

  return status === 422
}

function extractRepositoryFullName (searchResult) {
  const repositoryFullName = String(searchResult?.repository?.full_name ?? '').trim().toLowerCase()

  if (repositoryFullName) {
    return repositoryFullName
  }

  const repositoryUrl = String(searchResult?.repository_url ?? '').trim()

  if (!repositoryUrl) {
    return ''
  }

  try {
    const { pathname } = new URL(repositoryUrl)
    const pathSegments = pathname.split('/').filter(Boolean)

    if (pathSegments.length < 3 || pathSegments[0] !== 'repos') {
      return ''
    }

    return `${pathSegments[1]}/${pathSegments[2]}`.toLowerCase()
  } catch {
    return ''
  }
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
