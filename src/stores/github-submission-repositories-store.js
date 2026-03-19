import { computed, ref } from 'vue'
import { Octokit } from '@octokit/rest'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useSessionStore } from 'src/stores/session-store'
import githubApiConfig from 'src/config/github_api.yml'

const ORGANIZATION_PAGE_SIZE = githubApiConfig.organizationPageSize
const REPOSITORY_PAGE_SIZE = githubApiConfig.repositoryPageSize

export const useGitHubSubmissionRepositoriesStore = defineStore('github-submission-repositories', () => {
  const sessionStore = useSessionStore()
  const viewerLogin = ref('')
  const organizations = ref([])
  const repositoriesByOrganization = ref({})
  const isLoadingOrganizations = ref(false)
  const loadingRepositories = ref({})
  const hasLoadedOrganizations = ref(false)
  const loadedAccessToken = ref('')
  const errorMessageKey = ref('')

  const githubAccessToken = computed(() => sessionStore.getActiveAccessToken('github'))
  const defaultOrganization = computed(() => viewerLogin.value || '')

  function reset () {
    viewerLogin.value = ''
    organizations.value = []
    repositoriesByOrganization.value = {}
    loadingRepositories.value = {}
    hasLoadedOrganizations.value = false
    loadedAccessToken.value = ''
    errorMessageKey.value = ''
  }

  function repositoriesForOrganization (organizationLogin) {
    const normalizedOrganizationLogin = String(organizationLogin ?? '').trim()

    if (!normalizedOrganizationLogin) {
      return []
    }

    return repositoriesByOrganization.value[normalizedOrganizationLogin] ?? []
  }

  function isLoadingRepositoriesForOrganization (organizationLogin) {
    const normalizedOrganizationLogin = String(organizationLogin ?? '').trim()

    if (!normalizedOrganizationLogin) {
      return false
    }

    return Boolean(loadingRepositories.value[normalizedOrganizationLogin])
  }

  async function ensureOrganizationsLoaded () {
    const accessToken = githubAccessToken.value

    if (!accessToken) {
      reset()
      return []
    }

    if (hasLoadedOrganizations.value && loadedAccessToken.value === accessToken) {
      return organizations.value
    }

    isLoadingOrganizations.value = true
    errorMessageKey.value = ''
    repositoriesByOrganization.value = {}

    try {
      const octokit = new Octokit({ auth: accessToken })
      const authenticatedUserResponse = await octokit.rest.users.getAuthenticated()
      const normalizedViewerLogin = String(authenticatedUserResponse.data?.login ?? '').trim()
      const ownedOrganizations = await fetchOwnedOrganizations(octokit)
      const organizationsByLogin = new Map()

      if (normalizedViewerLogin) {
        organizationsByLogin.set(normalizedViewerLogin.toLowerCase(), {
          login: normalizedViewerLogin,
          avatarUrl: String(authenticatedUserResponse.data?.avatar_url ?? '').trim()
        })
      }

      for (const organizationProfile of ownedOrganizations) {
        const normalizedLogin = String(organizationProfile?.login ?? '').trim()

        if (!normalizedLogin) {
          continue
        }

        const key = normalizedLogin.toLowerCase()

        if (!organizationsByLogin.has(key)) {
          organizationsByLogin.set(key, {
            login: normalizedLogin,
            avatarUrl: String(organizationProfile?.avatarUrl ?? '').trim()
          })
        }
      }

      const knownOrganizations = Array.from(organizationsByLogin.values()).map((organizationProfile) => organizationProfile.login)

      viewerLogin.value = normalizedViewerLogin
      organizations.value = knownOrganizations
        .sort((left, right) => sortOrganizations(left, right, normalizedViewerLogin))
        .map((organizationLogin) => ({
          label: organizationLogin,
          value: organizationLogin,
          avatarUrl: organizationsByLogin.get(organizationLogin.toLowerCase())?.avatarUrl ?? ''
        }))
      hasLoadedOrganizations.value = true
      loadedAccessToken.value = accessToken
      return organizations.value
    } catch (error) {
      errorMessageKey.value = resolveErrorMessageKey(error)
      throw error
    } finally {
      isLoadingOrganizations.value = false
    }
  }

  async function ensureRepositoriesLoaded (organizationLogin) {
    const accessToken = githubAccessToken.value
    const normalizedOrganizationLogin = String(organizationLogin ?? '').trim()

    if (!accessToken || !normalizedOrganizationLogin) {
      return []
    }

    const cachedRepositories = repositoriesForOrganization(normalizedOrganizationLogin)

    if (cachedRepositories.length) {
      return cachedRepositories
    }

    if (isLoadingRepositoriesForOrganization(normalizedOrganizationLogin)) {
      return cachedRepositories
    }

    loadingRepositories.value = {
      ...loadingRepositories.value,
      [normalizedOrganizationLogin]: true
    }
    errorMessageKey.value = ''

    try {
      const octokit = new Octokit({ auth: accessToken })
      const isViewerOrganization = normalizedOrganizationLogin.toLowerCase() === viewerLogin.value.toLowerCase()
      const repositories = isViewerOrganization
        ? await octokit.paginate(
            octokit.rest.repos.listForAuthenticatedUser,
            {
              visibility: 'public',
              affiliation: 'owner',
              sort: 'updated',
              direction: 'desc',
              per_page: REPOSITORY_PAGE_SIZE
            }
          )
        : await octokit.paginate(
            octokit.rest.repos.listForOrg,
            {
              org: normalizedOrganizationLogin,
              type: 'public',
              sort: 'updated',
              direction: 'desc',
              per_page: REPOSITORY_PAGE_SIZE
            }
          )
      const normalizedRepositories = repositories
        .filter((repository) =>
          repository?.name
          && !repository.archived
          && !repository.disabled
          && !repository.fork)
        .map((repository) => ({
          id: repository.id,
          name: repository.name,
          fullName: repository.full_name,
          owner: repository.owner?.login ?? normalizedOrganizationLogin,
          htmlUrl: repository.html_url ?? '',
          updatedAt: repository.updated_at ?? ''
        }))
        .sort(sortRepositoriesByUpdatedAt)

      repositoriesByOrganization.value = {
        ...repositoriesByOrganization.value,
        [normalizedOrganizationLogin]: normalizedRepositories
      }

      return normalizedRepositories
    } catch (error) {
      errorMessageKey.value = resolveErrorMessageKey(error)
      throw error
    } finally {
      loadingRepositories.value = {
        ...loadingRepositories.value,
        [normalizedOrganizationLogin]: false
      }
    }
  }

  return {
    viewerLogin,
    organizations,
    repositoriesByOrganization,
    isLoadingOrganizations,
    hasLoadedOrganizations,
    defaultOrganization,
    errorMessageKey,
    reset,
    repositoriesForOrganization,
    isLoadingRepositoriesForOrganization,
    ensureOrganizationsLoaded,
    ensureRepositoriesLoaded
  }
}, {
  persist: false
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGitHubSubmissionRepositoriesStore, import.meta.hot))
}

async function fetchOwnedOrganizations (octokit) {
  try {
    const memberships = await octokit.paginate(
      'GET /user/memberships/orgs',
      {
        state: 'active',
        per_page: ORGANIZATION_PAGE_SIZE
      }
    )

    return memberships
      .filter((membership) => membership?.role === 'admin')
      .map((membership) => ({
        login: String(membership?.organization?.login ?? '').trim(),
        avatarUrl: String(membership?.organization?.avatar_url ?? '').trim()
      }))
      .filter((organizationProfile) => Boolean(organizationProfile.login))
  } catch (error) {
    if (isMembershipPermissionError(error)) {
      return []
    }

    throw error
  }
}

function isMembershipPermissionError (error) {
  const status = Number(error?.status ?? error?.response?.status)

  return status === 403 || status === 404
}

function sortOrganizations (left, right, preferredOrganization) {
  if (left === preferredOrganization && right !== preferredOrganization) {
    return -1
  }

  if (right === preferredOrganization && left !== preferredOrganization) {
    return 1
  }

  return left.localeCompare(right)
}

function sortRepositoriesByUpdatedAt (left, right) {
  const leftTimestamp = Date.parse(left.updatedAt)
  const rightTimestamp = Date.parse(right.updatedAt)

  if (Number.isFinite(leftTimestamp) && Number.isFinite(rightTimestamp)) {
    return rightTimestamp - leftTimestamp
  }

  return left.name.localeCompare(right.name)
}

function resolveErrorMessageKey (error) {
  const status = Number(error?.status ?? error?.response?.status)

  if (status === 403 || status === 429) {
    return 'dock.submissions.errors.rateLimited'
  }

  return 'dock.submissions.errors.loadFailed'
}
