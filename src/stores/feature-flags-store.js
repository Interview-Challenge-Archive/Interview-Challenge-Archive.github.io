import { computed, onScopeDispose, ref } from 'vue'
import { acceptHMRUpdate, defineStore } from 'pinia'
import { ProviderEvents } from '@openfeature/web-sdk'

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

  function getBooleanFlag (flagName, defaultValue = false) {
    return requireFeatureFlagsClient(featureFlagsClient).getBooleanValue(flagName, defaultValue)
  }

  const siteEnabled = computed(() => {
    evaluationRevision.value

    return getBooleanFlag('site_enabled', true)
  })

  function getFlag (flagName, defaultValue = false) {
    return getBooleanFlag(flagName, defaultValue)
  }

  function isEnabled (flagName, defaultValue = false) {
    return getBooleanFlag(flagName, defaultValue)
  }

  return {
    siteEnabled,
    setFeatureFlagsClient,
    getFlag,
    getBooleanFlag,
    isEnabled
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFeatureFlagsStore, import.meta.hot))
}
