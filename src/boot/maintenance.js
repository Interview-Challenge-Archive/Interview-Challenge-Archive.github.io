import { defineBoot } from '#q-app/wrappers'
import { useFeatureFlagsStore } from 'src/stores/feature-flags-store'

export default defineBoot(({ router, store }) => {
  const featureFlagsStore = useFeatureFlagsStore(store)

  router.beforeEach((to) => {
    const isMaintenanceRoute = to.name === 'site-maintenance'

    if (!featureFlagsStore.siteEnabled && !isMaintenanceRoute) {
      return { name: 'site-maintenance' }
    }

    if (featureFlagsStore.siteEnabled && isMaintenanceRoute) {
      return { name: 'home' }
    }

    return true
  })
})