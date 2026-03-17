import { computed, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import {
  ACCOUNT_SESSION_STORAGE_KEY_PREFIX,
  useAccountSessionStore
} from 'src/stores/account-session-store'

export const SESSION_STORAGE_SESSION_KEY = 'job-test-vault-session'

const sessionPersistStorage = typeof window !== 'undefined' ? window.sessionStorage : null

export const useSessionStore = defineStore('session', () => {
  const accounts = ref({})
  const sessionContext = {}

  function linkAccountStore (accountId) {
    const linkedStore = useAccountSessionStore(sessionContext, accountId)

    if (!linkedStore) {
      return null
    }

    accounts.value = {
      ...accounts.value,
      [accountId]: linkedStore
    }

    return linkedStore
  }

  function unlinkAccountStore (accountId) {
    const nextAccounts = { ...accounts.value }

    delete nextAccounts[accountId]
    accounts.value = nextAccounts
  }

  function linkedAccountIds () {
    return Object.keys(accounts.value)
  }

  function hydrateAccountsFromSessionStorage () {
    if (!sessionPersistStorage) {
      return
    }

    for (let index = 0; index < sessionPersistStorage.length; index += 1) {
      const key = sessionPersistStorage.key(index)

      if (!key || !key.startsWith(`${ACCOUNT_SESSION_STORAGE_KEY_PREFIX}:`)) {
        continue
      }

      const accountId = key.slice(`${ACCOUNT_SESSION_STORAGE_KEY_PREFIX}:`.length)

      if (accountId) {
        linkAccountStore(accountId)
      }
    }
  }

  hydrateAccountsFromSessionStorage()

  function hasSessionData (store) {
    if (!store || !store.provider || !store.accessToken || !store.user) {
      return false
    }

    return true
  }

  function resolveExpirationTimestamp (store) {
    if (!hasSessionData(store)) {
      return null
    }

    if (!Number.isFinite(store.expiresIn) || store.expiresIn <= 0) {
      return null
    }

    const authenticatedAtMs = Date.parse(store.authenticatedAt)

    if (!Number.isFinite(authenticatedAtMs)) {
      return null
    }

    return authenticatedAtMs + (store.expiresIn * 1000)
  }

  const nearestExpirationAt = computed(() => {
    let nearestExpirationTimestamp = null
    const now = Date.now()

    for (const accountStore of Object.values(accounts.value)) {
      const expirationTimestamp = resolveExpirationTimestamp(accountStore)

      if (!Number.isFinite(expirationTimestamp) || expirationTimestamp <= now) {
        continue
      }

      if (nearestExpirationTimestamp === null || expirationTimestamp < nearestExpirationTimestamp) {
        nearestExpirationTimestamp = expirationTimestamp
      }
    }

    return nearestExpirationTimestamp === null
      ? null
      : new Date(nearestExpirationTimestamp).toISOString()
  })

  const hasNonExpiringSession = computed(() => {
    for (const accountStore of Object.values(accounts.value)) {
      if (!hasSessionData(accountStore)) {
        continue
      }

      if (!Number.isFinite(accountStore.expiresIn) || accountStore.expiresIn <= 0) {
        return true
      }
    }

    return false
  })

  const isAuthenticated = computed(() => {
    if (nearestExpirationAt.value !== null) {
      return true
    }

    return hasNonExpiringSession.value
  })

  function resolveAccountIdentifier (payload) {
    const providerId = typeof payload.provider === 'string' ? payload.provider.trim() : ''
    const account = payload.user && typeof payload.user === 'object' ? payload.user : null
    const accountId = account
      ? account.sub || account.id || account.login || account.email
      : null
    const normalizedAccountId = typeof accountId === 'string' || typeof accountId === 'number'
      ? String(accountId).trim()
      : ''

    if (providerId && normalizedAccountId) {
      return `${providerId}:${normalizedAccountId}`
    }

    return providerId || normalizedAccountId || `account:${Date.now()}`
  }

  function normalizeSessionPayload (payload) {
    return {
      provider: payload.provider ?? null,
      accessToken: payload.accessToken ?? '',
      tokenType: payload.tokenType ?? 'Bearer',
      scope: payload.scope ?? '',
      expiresIn: Number.isFinite(payload.expiresIn) ? payload.expiresIn : null,
      authenticatedAt: payload.authenticatedAt ?? new Date().toISOString(),
      user: payload.user ?? null
    }
  }

  function setSession (payload) {
    const accountId = resolveAccountIdentifier(payload)
    const normalizedPayload = normalizeSessionPayload(payload)
    const targetAccountStore = accounts.value[accountId] ?? linkAccountStore(accountId)

    if (!targetAccountStore) {
      return
    }

    targetAccountStore.$patch(normalizedPayload)
  }

  function clearSession (accountId) {
    const removedAccountId = accountId ?? linkedAccountIds()[0]

    if (!removedAccountId) {
      return
    }

    const removedStore = accounts.value[removedAccountId]

    if (removedStore) {
      removedStore.clearSession()
    }

    unlinkAccountStore(removedAccountId)
  }

  function clearAllSessions () {
    for (const store of Object.values(accounts.value)) {
      store.clearSession()
    }

    accounts.value = {}
  }

  function logout () {
    clearAllSessions()
  }

  return {
    accounts,
    nearestExpirationAt,
    isAuthenticated,
    setSession,
    logout,
    clearSession,
    clearAllSessions
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSessionStore, import.meta.hot))
}
