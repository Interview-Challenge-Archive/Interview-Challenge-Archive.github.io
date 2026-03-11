import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { createApp, nextTick } from 'vue'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {
  LOCAL_STORAGE_FEATURE_FLAGS_KEY,
  useFeatureFlagsStore
} from 'src/stores/feature-flags-store'

function createFeatureFlagsClient (flagValues = {}) {
  return {
    addHandler: () => {},
    removeHandler: () => {},
    getBooleanValue: (flagName, defaultValue) => flagValues[flagName] ?? defaultValue
  }
}

function createStore () {
  const app = createApp({})
  const pinia = createPinia()

  pinia.use(piniaPluginPersistedstate)
  app.use(pinia)
  setActivePinia(pinia)

  const featureFlagsStore = useFeatureFlagsStore(pinia)

  featureFlagsStore.setFeatureFlagsClient(createFeatureFlagsClient({
    site_enabled: true
  }))

  return featureFlagsStore
}

describe('useFeatureFlagsStore', () => {
  beforeEach(() => {
    window.localStorage.removeItem(LOCAL_STORAGE_FEATURE_FLAGS_KEY)
  })

  it('reads the site_enabled flag from the configured client', () => {
    const store = createStore()

    expect(store.fetchingEnabled).toBe(false)
    expect(store.getFlag('site_enabled')).toBe(true)
    expect(store.siteEnabled).toBe(true)
    expect(store.getFlag('site_enabled')).toBe(true)
    expect(store.getFlag('missing_flag')).toBe(false)
    expect(store.cachedFlags).toEqual({
      site_enabled: true,
      missing_flag: false
    })
  })

  it('prefers cached flags loaded from localStorage when fetching is disabled', () => {
    window.localStorage.setItem(LOCAL_STORAGE_FEATURE_FLAGS_KEY, JSON.stringify({
      cachedFlags: {
        site_enabled: false
      },
      fetchingEnabled: false
    }))

    const store = createStore()

    expect(store.getFlag('site_enabled', true)).toBe(false)
    expect(store.siteEnabled).toBe(false)
    expect(store.getFlag('site_enabled', true)).toBe(false)
    expect(store.fetchingEnabled).toBe(false)
  })

  it('persists cached flags and fetchingEnabled through localStorage', async () => {
    const store = createStore()

    store.cachedFlags = {
      site_enabled: false
    }
    store.fetchingEnabled = true
    await nextTick()

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_FEATURE_FLAGS_KEY))).toEqual({
      cachedFlags: {
        site_enabled: false
      },
      fetchingEnabled: true
    })
    expect(store.siteEnabled).toBe(true)

    store.fetchingEnabled = false
    store.cachedFlags = {}
    await nextTick()

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_FEATURE_FLAGS_KEY))).toEqual({
      cachedFlags: {},
      fetchingEnabled: false
    })
    expect(store.siteEnabled).toBe(true)
  })

  it('fetches the live flag when fetchingEnabled is true even if a cached value exists', async () => {
    window.localStorage.setItem(LOCAL_STORAGE_FEATURE_FLAGS_KEY, JSON.stringify({
      cachedFlags: {
        site_enabled: false
      },
      fetchingEnabled: true
    }))

    const store = createStore()

    expect(store.getFlag('site_enabled', false)).toBe(true)
    expect(store.siteEnabled).toBe(true)
    expect(store.cachedFlags).toEqual({
      site_enabled: true
    })

    await nextTick()

    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_FEATURE_FLAGS_KEY))).toEqual({
      cachedFlags: {
        site_enabled: true
      },
      fetchingEnabled: true
    })
  })
})
