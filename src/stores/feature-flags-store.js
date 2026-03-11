import { computed, onScopeDispose, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ProviderEvents } from '@openfeature/web-sdk'

export const LOCAL_STORAGE_FEATURE_FLAGS_KEY = 'feature-flags-overrides'

const isFeatureFlagsCacheEnabled = import.meta.env.DEV || import.meta.env.MODE === 'test'

function requireFeatureFlagsClient (featureFlagsClient) {
  if (!featureFlagsClient) {
    throw new Error(
      'Feature flags client has not been initialized. Make sure the open-feature boot file runs before using the feature flags store.'
    )
  }

  return featureFlagsClient
}

export const useFeatureFlagsStore = defineStore('feature-flags', () => {
  let featureFlagsClient = null
  const evaluationRevision = ref(0)
  const cachedFlags = ref({})
  const fetchingEnabled = ref(!isFeatureFlagsCacheEnabled)
  const refreshFlags = () => {
    evaluationRevision.value += 1
  }

  function detachClientHandlers () {
    if (!featureFlagsClient) {
      return
    }

    featureFlagsClient.removeHandler(ProviderEvents.Ready, refreshFlags)
    featureFlagsClient.removeHandler(ProviderEvents.Error, refreshFlags)
    featureFlagsClient.removeHandler(ProviderEvents.ConfigurationChanged, refreshFlags)
  }

  function attachClientHandlers () {
    const initializedClient = requireFeatureFlagsClient(featureFlagsClient)

    initializedClient.addHandler(ProviderEvents.Ready, refreshFlags)
    initializedClient.addHandler(ProviderEvents.Error, refreshFlags)
    initializedClient.addHandler(ProviderEvents.ConfigurationChanged, refreshFlags)
  }

  function setFeatureFlagsClient (nextFeatureFlagsClient) {
    detachClientHandlers()
    featureFlagsClient = nextFeatureFlagsClient
    attachClientHandlers()
    refreshFlags()
  }

  onScopeDispose(() => {
    detachClientHandlers()
  })

  function getFlag (flagName, defaultValue = false) {
    if (!fetchingEnabled.value) {
      const cachedFlag = cachedFlags.value[flagName]

      if (typeof cachedFlag === 'boolean') {
        return cachedFlag
      }
    }

    const value = requireFeatureFlagsClient(featureFlagsClient).getBooleanValue(flagName, defaultValue)

    if (typeof value === 'boolean') {
      if (cachedFlags.value[flagName] !== value) {
        cachedFlags.value = {
          ...cachedFlags.value,
          [flagName]: value
        }
      }

      return value
    }

    return defaultValue
  }

  const siteEnabled = computed(() => {
    evaluationRevision.value

    return getFlag('site_enabled', true)
  })

  return {
    cachedFlags,
    fetchingEnabled,
    siteEnabled,
    setFeatureFlagsClient,
    getFlag
  }
}, {
  persist: isFeatureFlagsCacheEnabled
    ? {
        key: LOCAL_STORAGE_FEATURE_FLAGS_KEY,
        pick: ['cachedFlags', 'fetchingEnabled']
      }
    : false
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFeatureFlagsStore, import.meta.hot))
}
