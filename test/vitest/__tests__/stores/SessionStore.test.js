import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { buildAccountSessionStorageKey, useAccountSessionStore } from 'src/stores/account-session-store'
import { useSessionStore } from 'src/stores/session-store'

function createSessionStore () {
  const app = createApp({})
  const pinia = createPinia()

  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  setActivePinia(pinia)

  return useSessionStore(pinia)
}

describe('useSessionStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  it('stores the OAuth session payload and exposes derived user details', async () => {
    const store = createSessionStore()
    const authenticatedAt = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    store.setSession({
      provider: 'linkedin',
      accessToken: 'linkedin-access-token',
      tokenType: 'Bearer',
      scope: 'openid profile email',
      expiresIn: 3600,
      authenticatedAt,
      user: {
        given_name: 'Ada',
        family_name: 'Lovelace',
        email: 'ada@example.com',
        picture: 'https://images.example/ada.png'
      }
    })
    await nextTick()
    const activeAccountStore = useAccountSessionStore(store, 'linkedin:ada@example.com')

    expect(store.isAuthenticated).toBe(true)
    expect(store.nearestExpirationAt).toBeTruthy()
    expect(activeAccountStore.displayName).toBe('Ada Lovelace')
    expect(activeAccountStore.email).toBe('ada@example.com')
    expect(activeAccountStore.avatarUrl).toBe('https://images.example/ada.png')
    expect(window.localStorage.getItem('job-test-vault-session')).toBeNull()

    const accountPersistedSession = JSON.parse(
      window.localStorage.getItem(buildAccountSessionStorageKey('linkedin:ada@example.com'))
    )

    expect(accountPersistedSession).toEqual({
      provider: 'linkedin',
      accessToken: 'linkedin-access-token',
      tokenType: 'Bearer',
      scope: 'openid profile email',
      expiresIn: 3600,
      authenticatedAt,
      user: {
        given_name: 'Ada',
        family_name: 'Lovelace',
        email: 'ada@example.com',
        picture: 'https://images.example/ada.png'
      }
    })
  })

  it('stores account sessions in sub-stores and switches active account', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'github-token',
      user: {
        login: 'octocat',
        name: 'The Octocat'
      }
    })
    store.setSession({
      provider: 'linkedin',
      accessToken: 'linkedin-token',
      user: {
        email: 'ada@example.com',
        given_name: 'Ada',
        family_name: 'Lovelace'
      }
    })
    await nextTick()
    const githubAccountStore = useAccountSessionStore(store, 'github:octocat')
    const linkedinAccountStore = useAccountSessionStore(store, 'linkedin:ada@example.com')

    expect(Object.keys(store.accounts)).toEqual(['github:octocat', 'linkedin:ada@example.com'])
    expect(store.accounts['github:octocat']).toBe(githubAccountStore)
    expect(store.accounts['linkedin:ada@example.com']).toBe(linkedinAccountStore)
    expect(store.isAuthenticated).toBe(true)
    expect(linkedinAccountStore.provider).toBe('linkedin')
    expect(linkedinAccountStore.displayName).toBe('Ada Lovelace')

    expect(githubAccountStore.provider).toBe('github')
    expect(githubAccountStore.displayName).toBe('The Octocat')
    expect(window.localStorage.getItem('job-test-vault-session')).toBeNull()
    expect(JSON.parse(window.localStorage.getItem(buildAccountSessionStorageKey('github:octocat')))).toEqual({
      provider: 'github',
      accessToken: 'github-token',
      tokenType: 'Bearer',
      scope: '',
      expiresIn: null,
      authenticatedAt: expect.any(String),
      user: {
        login: 'octocat',
        name: 'The Octocat'
      }
    })
    expect(JSON.parse(window.localStorage.getItem(buildAccountSessionStorageKey('linkedin:ada@example.com')))).toEqual({
      provider: 'linkedin',
      accessToken: 'linkedin-token',
      tokenType: 'Bearer',
      scope: '',
      expiresIn: null,
      authenticatedAt: expect.any(String),
      user: {
        email: 'ada@example.com',
        given_name: 'Ada',
        family_name: 'Lovelace'
      }
    })
  })

  it('clears one linked account sub-store session by default', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'github-token',
      user: {
        login: 'octocat',
        name: 'The Octocat'
      }
    })
    store.setSession({
      provider: 'linkedin',
      accessToken: 'linkedin-token',
      user: {
        email: 'ada@example.com',
        given_name: 'Ada',
        family_name: 'Lovelace'
      }
    })
    await nextTick()
    const linkedinAccountStore = useAccountSessionStore(store, 'linkedin:ada@example.com')

    store.clearSession()
    await nextTick()

    expect(Object.keys(store.accounts)).toEqual(['linkedin:ada@example.com'])
    expect(store.isAuthenticated).toBe(true)
    expect(linkedinAccountStore.provider).toBe('linkedin')
    expect(window.localStorage.getItem(buildAccountSessionStorageKey('github:octocat'))).toBeNull()
  })

  it('clears the active account session state when it is the only account', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'token',
      user: {
        login: 'octocat'
      }
    })
    await nextTick()
    const activeAccountStore = useAccountSessionStore(store, 'github:octocat')

    store.clearSession()
    await nextTick()

    expect(store.isAuthenticated).toBe(false)
    expect(store.nearestExpirationAt).toBeNull()
    expect(activeAccountStore.provider).toBeNull()
    expect(activeAccountStore.accessToken).toBe('')
    expect(activeAccountStore.user).toBeNull()
    expect(window.localStorage.getItem('job-test-vault-session')).toBeNull()
    expect(window.localStorage.getItem(buildAccountSessionStorageKey('github:octocat'))).toBeNull()
  })

  it('considers the session unauthenticated when all account sessions are expired', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'expired-token',
      expiresIn: 60,
      authenticatedAt: '2026-03-17T10:00:00.000Z',
      user: {
        login: 'octocat'
      }
    })
    await nextTick()

    expect(store.isAuthenticated).toBe(false)
    expect(store.nearestExpirationAt).toBeNull()
  })

  it('returns the active provider access token and prefers the latest authenticated session', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'older-token',
      authenticatedAt: '2026-03-18T08:00:00.000Z',
      user: {
        login: 'octocat-old'
      }
    })
    store.setSession({
      provider: 'github',
      accessToken: 'newer-token',
      authenticatedAt: '2026-03-18T10:00:00.000Z',
      user: {
        login: 'octocat-new'
      }
    })
    await nextTick()

    expect(store.getActiveAccessToken('github')).toBe('newer-token')
  })

  it('returns an empty provider token when no active session is available', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'expired-token',
      expiresIn: 10,
      authenticatedAt: '2026-03-18T00:00:00.000Z',
      user: {
        login: 'octocat'
      }
    })
    await nextTick()

    expect(store.getActiveAccessToken('github')).toBe('')
  })

  it('logout clears all account-session stores', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'github-token',
      user: {
        login: 'octocat'
      }
    })
    store.setSession({
      provider: 'linkedin',
      accessToken: 'linkedin-token',
      user: {
        email: 'ada@example.com'
      }
    })
    await nextTick()

    store.logout()
    await nextTick()

    expect(Object.keys(store.accounts)).toEqual([])
    expect(store.isAuthenticated).toBe(false)
  })

  it('disposes account-session stores when clearing an account session', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'github-token',
      user: {
        login: 'octocat'
      }
    })
    await nextTick()

    const githubAccountStore = useAccountSessionStore(store, 'github:octocat')
    const disposeSpy = vi.spyOn(githubAccountStore, '$dispose')

    store.clearSession('github:octocat')
    await nextTick()

    expect(disposeSpy).toHaveBeenCalledTimes(1)
    expect(store.accounts['github:octocat']).toBeUndefined()
  })

  it('normalizes snake_case OAuth payload fields used by some providers', async () => {
    const store = createSessionStore()
    const authenticatedAt = new Date().toISOString()

    store.setSession({
      provider: 'linkedin',
      access_token: 'linkedin-snake-token',
      token_type: 'Bearer',
      expires_in: '3600',
      authenticated_at: authenticatedAt,
      profile: {
        sub: 'linkedin-user-id',
        name: 'Linked In User'
      }
    })
    await nextTick()
    const linkedinAccountStore = useAccountSessionStore(store, 'linkedin:linkedin-user-id')

    expect(store.isAuthenticated).toBe(true)
    expect(linkedinAccountStore.accessToken).toBe('linkedin-snake-token')
    expect(linkedinAccountStore.tokenType).toBe('Bearer')
    expect(linkedinAccountStore.expiresIn).toBe(3600)
    expect(linkedinAccountStore.user).toEqual({
      sub: 'linkedin-user-id',
      name: 'Linked In User'
    })
  })
})
