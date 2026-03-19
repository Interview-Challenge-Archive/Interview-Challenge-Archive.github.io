import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  reposGet: vi.fn(),
  reposListLanguages: vi.fn(),
  orgsGet: vi.fn(),
  usersGetByUsername: vi.fn(),
  octokitInstances: []
}))

vi.mock('@octokit/rest', () => ({
  Octokit: class {
    constructor(options = {}) {
      this.options = options
      this.rest = {
        repos: {
          get: mocks.reposGet,
          listLanguages: mocks.reposListLanguages
        },
        orgs: {
          get: mocks.orgsGet
        },
        users: {
          getByUsername: mocks.usersGetByUsername
        }
      }
      mocks.octokitInstances.push(this)
    }
  }
}))

import { useSessionStore } from 'src/stores/session-store'
import { useGitHubSubmissionProjectInfoStore } from 'src/stores/github-submission-project-info-store'

function createStores () {
  const app = createApp({})
  const pinia = createPinia()

  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  setActivePinia(pinia)

  return {
    sessionStore: useSessionStore(pinia),
    projectInfoStore: useGitHubSubmissionProjectInfoStore(pinia)
  }
}

describe('useGitHubSubmissionProjectInfoStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    mocks.reposGet.mockReset()
    mocks.reposListLanguages.mockReset()
    mocks.orgsGet.mockReset()
    mocks.usersGetByUsername.mockReset()
    mocks.octokitInstances.length = 0
  })

  it('derives project autofill fields from GitHub repository and organization profile', async () => {
    mocks.reposGet.mockResolvedValue({
      data: {
        html_url: 'https://github.com/octo-org/repo-a',
        description: 'Frontend take-home assignment focused on Vue UI',
        topics: ['take-home', 'frontend'],
        owner: { type: 'Organization' }
      }
    })
    mocks.reposListLanguages.mockResolvedValue({
      data: {
        JavaScript: 2200,
        Vue: 1800
      }
    })
    mocks.orgsGet.mockResolvedValue({
      data: {
        login: 'octo-org',
        name: 'Octo Corp',
        blog: 'https://www.linkedin.com/company/octo-corp/'
      }
    })

    const { sessionStore, projectInfoStore } = createStores()

    sessionStore.setSession({
      provider: 'github',
      accessToken: 'github-oauth-token',
      authenticatedAt: '2026-03-19T08:00:00.000Z',
      user: {
        login: 'octocat'
      }
    })

    const projectInfo = await projectInfoStore.refetchProjectInfo('octo-org', 'repo-a')

    expect(mocks.octokitInstances[0].options.auth).toBe('github-oauth-token')
    expect(projectInfo.projectType).toBe('take-home')
    expect(projectInfo.companyName).toBe('Octo Corp')
    expect(projectInfo.companyLinkedInUrl).toBe('https://www.linkedin.com/company/octo-corp/')
    expect(projectInfo.positionTitle).toBe('Frontend Engineer')
    expect(projectInfo.summary).toBe('Frontend take-home assignment focused on Vue UI')
    expect(projectInfo.languages).toEqual(['JavaScript', 'Vue'])
  })

  it('marks loading errors with translated rate-limit message key', async () => {
    mocks.reposGet.mockRejectedValue({
      status: 403
    })

    const { sessionStore, projectInfoStore } = createStores()

    sessionStore.setSession({
      provider: 'github',
      accessToken: 'github-oauth-token',
      authenticatedAt: '2026-03-19T08:00:00.000Z',
      user: {
        login: 'octocat'
      }
    })

    await expect(projectInfoStore.refetchProjectInfo('octo-org', 'repo-a')).rejects.toBeDefined()
    expect(projectInfoStore.errorMessageKey).toBe('dock.submissions.errors.rateLimited')
    expect(projectInfoStore.projectInfo.projectType).toBe('')
  })
})
