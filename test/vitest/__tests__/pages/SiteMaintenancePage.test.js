import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useMeta } from 'quasar'
import SiteMaintenancePage from 'src/pages/SiteMaintenancePage.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('SiteMaintenancePage', () => {
  it('reuses the shared home tile components for the maintenance preview', () => {
    const wrapper = mountWithApp(SiteMaintenancePage)

    expect(wrapper.find('.site-maintenance__preview').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.site-maintenance__preview > .loading-skeleton-tile').exists()).toBe(true)
    expect(wrapper.findAll('.site-maintenance__preview-grid > *')).toHaveLength(4)
    expect(wrapper.findAll('.site-maintenance__preview-grid > .loading-skeleton-tile')).toHaveLength(4)
    expect(wrapper.findAll('.site-maintenance__preview-grid > .decorative-placeholder-tile')).toHaveLength(4)
    expect(wrapper.html()).not.toContain('site-maintenance__preview-feature')
    expect(wrapper.html()).not.toContain('site-maintenance__preview-tile')
  })

  describe('SEO Metadata', () => {
    it('sets correct metadata with noindex', async () => {
      useMeta.mockClear()
      mountWithApp(SiteMaintenancePage)
      await flushPromises()

      expect(useMeta).toHaveBeenCalled()
      const metaFn = useMeta.mock.calls[0][0]
      const meta = metaFn()

      expect(meta.title).toBe('We are polishing the experience | Interview Challenge Archive')
      expect(meta.meta.robots.content).toBe('noindex, nofollow')
    })
  })
})
