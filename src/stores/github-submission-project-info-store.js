import { computed, ref } from 'vue'
import { Octokit } from '@octokit/rest'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { useSessionStore } from 'src/stores/session-store'
import { detectProjectType } from 'src/utils/project-type-detector'

const POSITION_MATCHERS = [
  { label: 'Frontend Engineer', keywords: ['frontend', 'front-end', 'ui', 'vue', 'react', 'angular'] },
  { label: 'Backend Engineer', keywords: ['backend', 'back-end', 'api', 'server', 'node', 'java', 'go'] },
  { label: 'Full Stack Engineer', keywords: ['fullstack', 'full-stack'] },
  { label: 'Mobile Engineer', keywords: ['mobile', 'android', 'ios', 'react-native', 'flutter'] },
  { label: 'DevOps Engineer', keywords: ['devops', 'platform', 'infrastructure', 'sre'] },
  { label: 'Data Engineer', keywords: ['data', 'analytics', 'ml', 'machine-learning'] },
  { label: 'QA Engineer', keywords: ['qa', 'testing', 'quality-assurance'] }
]

export const useGitHubSubmissionProjectInfoStore = defineStore('github-submission-project-info', () => {
  const sessionStore = useSessionStore()
  const projectInfo = ref(createEmptyProjectInfo())
  const isLoading = ref(false)
  const errorMessageKey = ref('')
  const loadedRepositoryKey = ref('')
  const loadedAccessToken = ref('')

  const githubAccessToken = computed(() => sessionStore.getActiveAccessToken('github'))

  function reset () {
    projectInfo.value = createEmptyProjectInfo()
    isLoading.value = false
    errorMessageKey.value = ''
    loadedRepositoryKey.value = ''
    loadedAccessToken.value = ''
  }

  async function refetchProjectInfo (owner, repository) {
    const accessToken = githubAccessToken.value
    const normalizedOwner = String(owner ?? '').trim()
    const normalizedRepository = String(repository ?? '').trim()
    const repositoryKey = normalizeRepositoryKey(normalizedOwner, normalizedRepository)

    if (!accessToken || !repositoryKey) {
      projectInfo.value = createEmptyProjectInfo()
      errorMessageKey.value = ''
      loadedRepositoryKey.value = ''
      loadedAccessToken.value = ''
      return projectInfo.value
    }

    isLoading.value = true
    errorMessageKey.value = ''

    try {
      const octokit = new Octokit({ auth: accessToken })
      const repositoryResponse = await octokit.rest.repos.get({
        owner: normalizedOwner,
        repo: normalizedRepository
      })
      const repositoryData = repositoryResponse.data ?? {}
      const ownerType = String(repositoryData?.owner?.type ?? '').trim()
      const [languageResponse, ownerProfile] = await Promise.all([
        octokit.rest.repos.listLanguages({
          owner: normalizedOwner,
          repo: normalizedRepository
        }),
        fetchOwnerProfile(octokit, normalizedOwner, ownerType)
      ])
      const normalizedProjectInfo = normalizeProjectInfo({
        owner: normalizedOwner,
        repository: normalizedRepository,
        repositoryData,
        ownerProfile,
        languagePayload: languageResponse?.data ?? {}
      })

      projectInfo.value = normalizedProjectInfo
      loadedRepositoryKey.value = repositoryKey
      loadedAccessToken.value = accessToken
      return normalizedProjectInfo
    } catch (error) {
      projectInfo.value = createEmptyProjectInfo()
      errorMessageKey.value = resolveErrorMessageKey(error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    projectInfo,
    isLoading,
    errorMessageKey,
    loadedRepositoryKey,
    loadedAccessToken,
    reset,
    refetchProjectInfo
  }
}, {
  persist: false
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGitHubSubmissionProjectInfoStore, import.meta.hot))
}

function normalizeProjectInfo ({
  owner,
  repository,
  repositoryData,
  ownerProfile,
  languagePayload
}) {
  const topics = Array.isArray(repositoryData?.topics)
    ? repositoryData.topics.filter(Boolean).map((topic) => String(topic).trim().toLowerCase())
    : []
  const summary = String(repositoryData?.description ?? '').trim()
  const homepage = String(repositoryData?.homepage ?? '').trim()
  const organizationName = resolveCompanyName(ownerProfile, repositoryData?.owner?.type, owner)
  const linkedInUrl = resolveLinkedInUrl([
    ownerProfile?.blog,
    homepage
  ])
  const languageEntries = Object.entries(languagePayload ?? {})
    .map(([name, bytes]) => ({
      name: String(name ?? '').trim(),
      bytes: Number(bytes) || 0
    }))
    .filter((languageRecord) => Boolean(languageRecord.name))
    .sort((left, right) => right.bytes - left.bytes)

  return {
    owner: String(owner ?? '').trim(),
    repository: String(repository ?? '').trim(),
    repositoryUrl: String(repositoryData?.html_url ?? '').trim(),
    summary,
    topics,
    languages: languageEntries.map((languageRecord) => languageRecord.name),
    projectType: detectProjectType({
      topics,
      summary,
      repository,
      languages: languageEntries.map((languageRecord) => languageRecord.name)
    }),
    companyName: organizationName,
    companyLinkedInUrl: linkedInUrl,
    positionTitle: resolvePositionTitle(topics, summary, repository)
  }
}

async function fetchOwnerProfile (octokit, owner, ownerType) {
  const normalizedOwner = String(owner ?? '').trim()

  if (!normalizedOwner) {
    return {}
  }

  if (ownerType === 'Organization') {
    const response = await octokit.rest.orgs.get({
      org: normalizedOwner
    })

    return response.data ?? {}
  }

  const response = await octokit.rest.users.getByUsername({
    username: normalizedOwner
  })

  return response.data ?? {}
}

function resolveCompanyName (ownerProfile, ownerType, ownerLogin) {
  if (ownerType === 'Organization') {
    const organizationName = String(ownerProfile?.name ?? '').trim()

    if (organizationName) {
      return organizationName
    }

    return String(ownerProfile?.login ?? ownerLogin ?? '').trim()
  }

  const userCompanyName = String(ownerProfile?.company ?? '')
    .replace(/^@/, '')
    .trim()

  if (userCompanyName) {
    return userCompanyName
  }

  return ''
}

function resolveLinkedInUrl (sources) {
  for (const source of sources) {
    const normalizedSource = String(source ?? '').trim()

    if (!normalizedSource) {
      continue
    }

    const linkedInMatch = normalizedSource.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s]+/i)

    if (!linkedInMatch) {
      continue
    }

    const rawUrl = linkedInMatch[0]
    const normalizedUrl = rawUrl.startsWith('http')
      ? rawUrl
      : `https://${rawUrl}`

    try {
      const url = new URL(normalizedUrl)
      return url.toString()
    } catch {
      continue
    }
  }

  return ''
}

function resolvePositionTitle (topics, summary, repository) {
  const normalizedText = [
    ...(Array.isArray(topics) ? topics : []),
    String(summary ?? '').trim().toLowerCase(),
    String(repository ?? '').trim().toLowerCase()
  ].join(' ')

  for (const matcher of POSITION_MATCHERS) {
    if (matcher.keywords.some((keyword) => normalizedText.includes(keyword))) {
      return matcher.label
    }
  }

  return ''
}

function createEmptyProjectInfo () {
  return {
    owner: '',
    repository: '',
    repositoryUrl: '',
    summary: '',
    topics: [],
    languages: [],
    projectType: '',
    companyName: '',
    companyLinkedInUrl: '',
    positionTitle: ''
  }
}

function normalizeRepositoryKey (owner, repository) {
  const normalizedOwner = String(owner ?? '').trim().toLowerCase()
  const normalizedRepository = String(repository ?? '').trim().toLowerCase()

  if (!normalizedOwner || !normalizedRepository) {
    return ''
  }

  return `${normalizedOwner}/${normalizedRepository}`
}

function resolveErrorMessageKey (error) {
  const status = Number(error?.status ?? error?.response?.status)

  if (status === 403 || status === 429) {
    return 'dock.submissions.errors.rateLimited'
  }

  return 'dock.submissions.errors.loadFailed'
}
