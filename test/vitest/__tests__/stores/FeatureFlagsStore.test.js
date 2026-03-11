import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { InMemoryProvider, OpenFeature } from '@openfeature/web-sdk'
import featureFlagsConfiguration from 'src/config/feature-flags.yml'
import { useFeatureFlagsStore } from 'src/stores/feature-flags-store'

describe('useFeatureFlagsStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    const featureFlagsProvider = new InMemoryProvider(featureFlagsConfiguration)
    const featureFlagsStore = useFeatureFlagsStore(pinia)

    setActivePinia(pinia)
    OpenFeature.setProvider(featureFlagsProvider)
    featureFlagsStore.setFeatureFlagsClient(OpenFeature.getClient())
  })

  it('reads the site_enabled flag from the local YAML config', () => {
    const store = useFeatureFlagsStore()

    expect(store.getFlag('site_enabled')).toBe(true)
    expect(store.getBooleanFlag('site_enabled')).toBe(true)
    expect(store.siteEnabled).toBe(true)
    expect(store.isEnabled('site_enabled')).toBe(true)
    expect(store.isEnabled('missing_flag')).toBe(false)
  })
})
