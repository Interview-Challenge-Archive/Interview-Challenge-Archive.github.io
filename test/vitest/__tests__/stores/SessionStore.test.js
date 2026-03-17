import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {
  SESSION_STORAGE_SESSION_KEY,
  useSessionStore
} from 'src/stores/session-store'

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
    window.sessionStorage.removeItem(SESSION_STORAGE_SESSION_KEY)
  })

  it('stores the OAuth session payload and exposes derived user details', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'linkedin',
      accessToken: 'linkedin-access-token',
      tokenType: 'Bearer',
      scope: 'openid profile email',
      expiresIn: 3600,
      authenticatedAt: '2026-03-17T10:00:00.000Z',
      user: {
        given_name: 'Ada',
        family_name: 'Lovelace',
        email: 'ada@example.com',
        picture: 'https://images.example/ada.png'
      }
    })
    await nextTick()

    expect(store.isAuthenticated).toBe(true)
    expect(store.displayName).toBe('Ada Lovelace')
    expect(store.email).toBe('ada@example.com')
    expect(store.avatarUrl).toBe('https://images.example/ada.png')
    expect(JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_SESSION_KEY))).toEqual({
      provider: 'linkedin',
      accessToken: 'linkedin-access-token',
      tokenType: 'Bearer',
      scope: 'openid profile email',
      expiresIn: 3600,
      authenticatedAt: '2026-03-17T10:00:00.000Z',
      user: {
        given_name: 'Ada',
        family_name: 'Lovelace',
        email: 'ada@example.com',
        picture: 'https://images.example/ada.png'
      }
    })
  })

  it('clears the active session state', async () => {
    const store = createSessionStore()

    store.setSession({
      provider: 'github',
      accessToken: 'token',
      user: {
        login: 'octocat'
      }
    })
    await nextTick()

    store.clearSession()
    await nextTick()

    expect(store.isAuthenticated).toBe(false)
    expect(store.provider).toBeNull()
    expect(store.accessToken).toBe('')
    expect(store.user).toBeNull()
  })
})
