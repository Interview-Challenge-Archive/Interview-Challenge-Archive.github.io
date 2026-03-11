import { defineBoot } from '#q-app/wrappers'
import { InMemoryProvider, OpenFeature } from '@openfeature/web-sdk'
import featureFlagsConfiguration from 'src/config/feature-flags.yml'
import { useFeatureFlagsStore } from 'src/stores/feature-flags-store'

export default defineBoot(({ store }) => {
  const featureFlagsProvider = new InMemoryProvider(featureFlagsConfiguration)

  OpenFeature.setProvider(featureFlagsProvider)

  useFeatureFlagsStore(store).setFeatureFlagsClient(OpenFeature.getClient())
})
