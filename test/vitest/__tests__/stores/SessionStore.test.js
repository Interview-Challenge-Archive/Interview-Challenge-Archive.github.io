import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { buildAccountSessionStorageKey, useAccountSessionStore } from 'src/stores/account-session-store'
import { SESSION_STORAGE_SESSION_KEY, useSessionStore } from 'src/stores/session-store'

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
    expect(window.sessionStorage.getItem(SESSION_STORAGE_SESSION_KEY)).toBeNull()

    const accountPersistedSession = JSON.parse(
      window.sessionStorage.getItem(buildAccountSessionStorageKey('linkedin:ada@example.com'))
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
    expect(window.sessionStorage.getItem(SESSION_STORAGE_SESSION_KEY)).toBeNull()
    expect(JSON.parse(window.sessionStorage.getItem(buildAccountSessionStorageKey('github:octocat')))).toEqual({
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
    expect(JSON.parse(window.sessionStorage.getItem(buildAccountSessionStorageKey('linkedin:ada@example.com')))).toEqual({
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
    expect(JSON.parse(window.sessionStorage.getItem(buildAccountSessionStorageKey('github:octocat')))).toEqual({
      provider: null,
      accessToken: '',
      tokenType: 'Bearer',
      scope: '',
      expiresIn: null,
      authenticatedAt: null,
      user: null
    })
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
    expect(window.sessionStorage.getItem(SESSION_STORAGE_SESSION_KEY)).toBeNull()
    expect(JSON.parse(window.sessionStorage.getItem(buildAccountSessionStorageKey('github:octocat')))).toEqual({
      provider: null,
      accessToken: '',
      tokenType: 'Bearer',
      scope: '',
      expiresIn: null,
      authenticatedAt: null,
      user: null
    })
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
})
