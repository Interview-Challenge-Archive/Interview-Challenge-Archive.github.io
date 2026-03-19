import { computed, ref } from 'vue'
import { Octokit } from '@octokit/rest'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useSessionStore } from 'src/stores/session-store'
import { readJsonCacheEntry, writeJsonCacheEntry } from 'src/utils/cache-storage'
import aboutConfig from 'src/config/about.yml'
import cacheConfig from 'src/config/cache.yml'
import githubApiConfig from 'src/config/github_api.yml'

const CONTRIBUTORS_CACHE_NAME = cacheConfig.projectOrganizationContributorsCacheName
const CONTRIBUTORS_CACHE_KEY = cacheConfig.projectOrganizationContributorsCacheKey
const MAX_REPOSITORIES_PER_REQUEST = githubApiConfig.repositoryPageSize
const MAX_CONTRIBUTOR_REQUESTS_IN_PARALLEL = githubApiConfig.contributorRequestsInParallel
const TOP_CONTRIBUTORS_PER_REPOSITORY = aboutConfig.about.contributors.topPerRepository
const TOP_CONTRIBUTORS_LIMIT = aboutConfig.about.contributors.topContributorsLimit
const CACHE_TTL_MS = aboutConfig.about.contributors.cacheTtlMs

export const useProjectOrganizationContributorsStore = defineStore('project-organization-contributors', () => {
  const sessionStore = useSessionStore()
  const contributors = ref([])
  const isLoading = ref(false)
  const hasLoaded = ref(false)
  const loadedOrganization = ref('')
  const statusState = ref('neutral')
  const statusMessageKey = ref('dock.about.contributors.loading')
  const statusMessageParams = ref({})

  const githubAccessToken = computed(() => sessionStore.getActiveAccessToken('github'))

  async function loadContributors (organization) {
    if (isLoading.value) {
      return
    }

    const organizationLabel = String(organization ?? '').trim()

    if (!organizationLabel) {
      contributors.value = []
      loadedOrganization.value = ''
      hasLoaded.value = true
      statusState.value = 'error'
      statusMessageKey.value = 'dock.about.contributors.errors.organizationNotConfigured'
      statusMessageParams.value = {}
      return
    }

    if (hasLoaded.value && loadedOrganization.value === organizationLabel) {
      return
    }

    contributors.value = []
    hasLoaded.value = false
    isLoading.value = true
    loadedOrganization.value = organizationLabel
    statusState.value = 'neutral'
    statusMessageKey.value = 'dock.about.contributors.loading'
    statusMessageParams.value = {}

    try {
      const cachedData = await readJsonCacheEntry(CONTRIBUTORS_CACHE_NAME, CONTRIBUTORS_CACHE_KEY, CACHE_TTL_MS)

      if (cachedData) {
        applyLoadedData(cachedData)
        return
      }

      const data = await fetchOrganizationTopContributors({
        organization: organizationLabel,
        accessToken: githubAccessToken.value,
        topPerRepository: TOP_CONTRIBUTORS_PER_REPOSITORY,
        topContributorsLimit: TOP_CONTRIBUTORS_LIMIT
      })
      await writeJsonCacheEntry(CONTRIBUTORS_CACHE_NAME, CONTRIBUTORS_CACHE_KEY, data)

      applyLoadedData(data)
    } catch (error) {
      hasLoaded.value = true
      statusState.value = 'error'
      statusMessageKey.value = resolveErrorMessageKey(error)
      statusMessageParams.value = {}
    } finally {
      isLoading.value = false
    }
  }

  function applyLoadedData (payload) {
    const nextContributors = Array.isArray(payload?.contributors)
      ? payload.contributors
      : []
    const repositoryCount = Number(payload?.repositoryCount) || 0

    contributors.value = nextContributors
    hasLoaded.value = true

    if (nextContributors.length) {
      statusState.value = 'success'
      statusMessageKey.value = 'dock.about.contributors.loaded'
      statusMessageParams.value = {
        contributors: nextContributors.length,
        repositories: repositoryCount
      }
      return
    }

    statusState.value = 'neutral'
    statusMessageKey.value = 'dock.about.contributors.empty'
    statusMessageParams.value = {}
  }

  return {
    contributors,
    isLoading,
    hasLoaded,
    statusState,
    statusMessageKey,
    statusMessageParams,
    loadContributors
  }
}, {
  persist: false
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useProjectOrganizationContributorsStore, import.meta.hot))
}

function resolveErrorMessageKey (error) {
  const status = Number(error?.status ?? error?.response?.status)

  if (status === 403 || status === 429) {
    return 'dock.about.contributors.errors.rateLimited'
  }

  return 'dock.about.contributors.errors.loadFailed'
}

async function fetchOrganizationTopContributors ({
  organization,
  accessToken = '',
  topPerRepository,
  topContributorsLimit
}) {
  const normalizedOrganization = String(organization ?? '').trim()

  if (!normalizedOrganization) {
    return {
      contributors: [],
      repositoryCount: 0
    }
  }

  const octokit = new Octokit(
    accessToken
      ? { auth: accessToken }
      : {}
  )
  const repositories = await octokit.paginate(
    octokit.rest.repos.listForOrg,
    {
      org: normalizedOrganization,
      type: 'public',
      per_page: MAX_REPOSITORIES_PER_REQUEST
    }
  )
  const repositoriesToScan = repositories.filter((repository) =>
    repository?.name && !repository.archived && !repository.disabled
  )
  const contributorsByLogin = new Map()

  await mapWithConcurrency(
    repositoriesToScan,
    MAX_CONTRIBUTOR_REQUESTS_IN_PARALLEL,
    async (repository) => {
      const contributors = await fetchRepositoryContributors(
        octokit,
        normalizedOrganization,
        repository.name,
        topPerRepository
      )

      for (const contributor of contributors) {
        mergeContributor(contributorsByLogin, contributor)
      }
    }
  )

  const contributors = Array.from(contributorsByLogin.values())
    .sort(sortByContributionAndLogin)
    .slice(0, topContributorsLimit)

  return {
    contributors,
    repositoryCount: repositoriesToScan.length
  }
}

async function fetchRepositoryContributors (octokit, owner, repository, perPage) {
  try {
    const response = await octokit.rest.repos.listContributors({
      owner,
      repo: repository,
      per_page: perPage,
      anon: 'false'
    })

    return response.data.filter((contributor) => contributor?.login)
  } catch (error) {
    if (isSkippableContributorsError(error)) {
      return []
    }

    throw error
  }
}

function isSkippableContributorsError (error) {
  const status = Number(error?.status ?? error?.response?.status)

  return status === 404 || status === 409
}

function mergeContributor (contributorsByLogin, contributor) {
  const login = String(contributor?.login ?? '').trim()

  if (!login) {
    return
  }

  const current = contributorsByLogin.get(login) ?? {
    login,
    avatarUrl: contributor?.avatar_url ?? '',
    profileUrl: contributor?.html_url ?? '',
    contributions: 0
  }

  current.contributions += Number(contributor?.contributions) || 0
  contributorsByLogin.set(login, current)
}

function sortByContributionAndLogin (first, second) {
  if (first.contributions !== second.contributions) {
    return second.contributions - first.contributions
  }

  return first.login.localeCompare(second.login)
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
