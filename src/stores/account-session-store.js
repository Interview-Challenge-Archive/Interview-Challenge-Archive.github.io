import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const ACCOUNT_SESSION_STORAGE_KEY_PREFIX = 'job-test-vault-session-account'

const accountPersistStorage = typeof window !== 'undefined' ? window.localStorage : null
const accountStoreFactoryCache = new Map()

function toStoreSafeId (accountId) {
  return String(accountId).replace(/[^a-zA-Z0-9_-]/g, '_')
}

export function buildAccountSessionStorageKey (accountId) {
  return `${ACCOUNT_SESSION_STORAGE_KEY_PREFIX}:${accountId}`
}

function createAccountSessionStoreFactory (accountId) {
  const storeId = `session-account-${toStoreSafeId(accountId)}`
  const storageKey = buildAccountSessionStorageKey(accountId)

  return defineStore(storeId, () => {
    const provider = ref(null)
    const accessToken = ref('')
    const tokenType = ref('Bearer')
    const scope = ref('')
    const expiresIn = ref(null)
    const authenticatedAt = ref(null)
    const user = ref(null)

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

    function clearSession () {
      provider.value = null
      accessToken.value = ''
      tokenType.value = 'Bearer'
      scope.value = ''
      expiresIn.value = null
      authenticatedAt.value = null
      user.value = null

      if (accountPersistStorage) {
        accountPersistStorage.removeItem(storageKey)
      }
    }

    return {
      provider,
      accessToken,
      tokenType,
      scope,
      expiresIn,
      authenticatedAt,
      user,
      displayName,
      email,
      avatarUrl,
      loginHandle,
      clearSession
    }
  }, {
    persist: accountPersistStorage
      ? {
          key: storageKey,
          storage: accountPersistStorage,
          pick: ['provider', 'accessToken', 'tokenType', 'scope', 'expiresIn', 'authenticatedAt', 'user']
        }
      : false
  })
}

export function useAccountSessionStore (sessionStore, accountId, pinia) {
  if (!sessionStore) {
    return null
  }

  const normalizedAccountId = String(accountId || '').trim()

  if (!normalizedAccountId) {
    return null
  }

  let storeFactory = accountStoreFactoryCache.get(normalizedAccountId)

  if (!storeFactory) {
    storeFactory = createAccountSessionStoreFactory(normalizedAccountId)
    accountStoreFactoryCache.set(normalizedAccountId, storeFactory)
  }

  return storeFactory(pinia)
}
