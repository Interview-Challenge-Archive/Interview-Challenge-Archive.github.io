import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'

export const SESSION_STORAGE_SESSION_KEY = 'job-test-vault-session'

const sessionPersistStorage = typeof window !== 'undefined' ? window.sessionStorage : null

export const useSessionStore = defineStore('session', () => {
  const provider = ref(null)
  const accessToken = ref('')
  const tokenType = ref('Bearer')
  const scope = ref('')
  const expiresIn = ref(null)
  const authenticatedAt = ref(null)
  const user = ref(null)

  const isAuthenticated = computed(() => Boolean(provider.value && accessToken.value && user.value))
  const displayName = computed(() => {
    const account = user.value

    if (!account || typeof account !== 'object') {
      return ''
    }

    return [account.given_name, account.family_name].filter(Boolean).join(' ')
      || account.name
      || account.login
      || account.email
      || account.sub
      || ''
  })
  const email = computed(() => {
    const account = user.value

    return account && typeof account === 'object' && typeof account.email === 'string'
      ? account.email
      : ''
  })
  const avatarUrl = computed(() => {
    const account = user.value

    return account && typeof account === 'object'
      ? account.avatar_url || account.picture || ''
      : ''
  })
  const loginHandle = computed(() => {
    const account = user.value

    return account && typeof account === 'object' && typeof account.login === 'string'
      ? account.login
      : ''
  })

  function setSession (session) {
    provider.value = session.provider ?? null
    accessToken.value = session.accessToken ?? ''
    tokenType.value = session.tokenType ?? 'Bearer'
    scope.value = session.scope ?? ''
    expiresIn.value = Number.isFinite(session.expiresIn) ? session.expiresIn : null
    authenticatedAt.value = session.authenticatedAt ?? new Date().toISOString()
    user.value = session.user ?? null
  }

  function clearSession () {
    provider.value = null
    accessToken.value = ''
    tokenType.value = 'Bearer'
    scope.value = ''
    expiresIn.value = null
    authenticatedAt.value = null
    user.value = null
  }

  return {
    provider,
    accessToken,
    tokenType,
    scope,
    expiresIn,
    authenticatedAt,
    user,
    isAuthenticated,
    displayName,
    email,
    avatarUrl,
    loginHandle,
    setSession,
    clearSession
  }
}, {
  persist: sessionPersistStorage
    ? {
        key: SESSION_STORAGE_SESSION_KEY,
        storage: sessionPersistStorage,
        pick: ['provider', 'accessToken', 'tokenType', 'scope', 'expiresIn', 'authenticatedAt', 'user']
      }
    : false
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSessionStore, import.meta.hot))
}