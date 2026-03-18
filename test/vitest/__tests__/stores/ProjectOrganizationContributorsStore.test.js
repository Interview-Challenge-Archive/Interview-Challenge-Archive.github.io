import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp, nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  readJsonCacheEntry: vi.fn(),
  writeJsonCacheEntry: vi.fn(),
  paginate: vi.fn(),
  listForOrg: vi.fn(),
  listContributors: vi.fn(),
  octokitInstances: []
}))

vi.mock('src/utils/cache-storage', () => ({
  readJsonCacheEntry: mocks.readJsonCacheEntry,
  writeJsonCacheEntry: mocks.writeJsonCacheEntry
}))

vi.mock('@octokit/rest', () => ({
  Octokit: class {
    constructor(options = {}) {
      this.options = options
      this.rest = {
        repos: {
          listForOrg: mocks.listForOrg,
          listContributors: mocks.listContributors
        }
      }
      this.paginate = mocks.paginate
      mocks.octokitInstances.push(this)
    }
  }
}))

import { useProjectOrganizationContributorsStore } from 'src/stores/project-organization-contributors-store'
import { useSessionStore } from 'src/stores/session-store'

function createStores () {
  const app = createApp({})
  const pinia = createPinia()

  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  setActivePinia(pinia)

  return {
    sessionStore: useSessionStore(pinia),
    contributorsStore: useProjectOrganizationContributorsStore(pinia)
  }
}

describe('useProjectOrganizationContributorsStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
    mocks.readJsonCacheEntry.mockReset()
    mocks.writeJsonCacheEntry.mockReset()
    mocks.paginate.mockReset()
    mocks.listForOrg.mockReset()
    mocks.listContributors.mockReset()
    mocks.octokitInstances.length = 0
  })

  it('loads from cache when cached contributor data exists', async () => {
    mocks.readJsonCacheEntry.mockResolvedValue({
      contributors: [
        { login: 'cached-user', avatarUrl: 'https://avatars.example/cached-user.png', profileUrl: 'https://github.com/cached-user', contributions: 11 }
      ],
      repositoryCount: 2
    })

    const { contributorsStore } = createStores()

    await contributorsStore.loadContributors('Interview-Challenge-Archive')

    expect(contributorsStore.hasLoaded).toBe(true)
    expect(contributorsStore.statusState).toBe('success')
    expect(contributorsStore.contributors).toHaveLength(1)
    expect(contributorsStore.contributors[0].login).toBe('cached-user')
    expect(mocks.writeJsonCacheEntry).not.toHaveBeenCalled()
    expect(mocks.paginate).not.toHaveBeenCalled()
  })

  it('fetches contributors with active GitHub token and persists aggregated result to cache', async () => {
    mocks.readJsonCacheEntry.mockResolvedValue(null)
    mocks.paginate.mockResolvedValue([
      { name: 'repo-one', archived: false, disabled: false },
      { name: 'repo-two', archived: false, disabled: false }
    ])
    mocks.listContributors.mockImplementation(async ({ repo }) => {
      if (repo === 'repo-one') {
        return {
          data: [
            { login: 'alice', avatar_url: 'https://avatars.example/alice.png', html_url: 'https://github.com/alice', contributions: 5 },
            { login: 'bob', avatar_url: 'https://avatars.example/bob.png', html_url: 'https://github.com/bob', contributions: 3 }
          ]
        }
      }

      return {
        data: [
          { login: 'alice', avatar_url: 'https://avatars.example/alice.png', html_url: 'https://github.com/alice', contributions: 2 }
        ]
      }
    })

    const { sessionStore, contributorsStore } = createStores()

    sessionStore.setSession({
      provider: 'github',
      accessToken: 'github-oauth-token',
      authenticatedAt: '2026-03-18T08:00:00.000Z',
      user: {
        login: 'octocat'
      }
    })
    await nextTick()

    await contributorsStore.loadContributors('Interview-Challenge-Archive')

    expect(mocks.octokitInstances[0].options.auth).toBe('github-oauth-token')
    expect(mocks.paginate).toHaveBeenCalledWith(mocks.listForOrg, expect.objectContaining({
      org: 'Interview-Challenge-Archive',
      type: 'public'
    }))
    expect(mocks.listContributors).toHaveBeenCalledTimes(2)
    expect(contributorsStore.statusState).toBe('success')
    expect(contributorsStore.contributors).toEqual([
      { login: 'alice', avatarUrl: 'https://avatars.example/alice.png', profileUrl: 'https://github.com/alice', contributions: 7 },
      { login: 'bob', avatarUrl: 'https://avatars.example/bob.png', profileUrl: 'https://github.com/bob', contributions: 3 }
    ])
    expect(mocks.writeJsonCacheEntry).toHaveBeenCalledWith(
      'project-organization-contributors-cache-v1',
      '/project-organization-contributors/v1',
      expect.objectContaining({
        repositoryCount: 2,
        contributors: expect.any(Array)
      })
    )
  })

  it('sets rate-limited status when GitHub API responds with 403', async () => {
    mocks.readJsonCacheEntry.mockResolvedValue(null)
    mocks.paginate.mockRejectedValue({ status: 403 })

    const { contributorsStore } = createStores()

    await contributorsStore.loadContributors('Interview-Challenge-Archive')

    expect(contributorsStore.hasLoaded).toBe(true)
    expect(contributorsStore.statusState).toBe('error')
    expect(contributorsStore.statusMessageKey).toBe('dock.about.contributors.errors.rateLimited')
  })
})
