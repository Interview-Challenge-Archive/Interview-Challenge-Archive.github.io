import { beforeEach, describe, expect, it, vi } from 'vitest'

const { featureFlagsStore } = vi.hoisted(() => ({
  featureFlagsStore: {
    siteEnabled: true
  }
}))

vi.mock('#q-app/wrappers', () => ({
  defineBoot: (callback) => callback
}))

vi.mock('src/stores/feature-flags-store', () => ({
  useFeatureFlagsStore: () => featureFlagsStore
}))

import maintenanceBoot from 'src/boot/maintenance.js'

describe('maintenance boot', () => {
  beforeEach(() => {
    featureFlagsStore.siteEnabled = true
  })

  it('redirects to the maintenance route when the site is disabled', () => {
    const router = { beforeEach: vi.fn() }

    maintenanceBoot({ router, store: {} })

    const navigationGuard = router.beforeEach.mock.calls[0][0]
    featureFlagsStore.siteEnabled = false

    expect(navigationGuard({ name: 'home' })).toEqual({ name: 'site-maintenance' })
  })

  it('redirects away from the maintenance route when the site is enabled', () => {
    const router = { beforeEach: vi.fn() }

    maintenanceBoot({ router, store: {} })

    const navigationGuard = router.beforeEach.mock.calls[0][0]

    expect(navigationGuard({ name: 'site-maintenance' })).toEqual({ name: 'home' })
  })

  it('allows navigation when the target route already matches site availability', () => {
    const router = { beforeEach: vi.fn() }

    maintenanceBoot({ router, store: {} })

    const navigationGuard = router.beforeEach.mock.calls[0][0]

    expect(navigationGuard({ name: 'home' })).toBe(true)

    featureFlagsStore.siteEnabled = false

    expect(navigationGuard({ name: 'site-maintenance' })).toBe(true)
  })
})
