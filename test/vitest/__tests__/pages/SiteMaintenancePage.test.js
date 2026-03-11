import { describe, expect, it } from 'vitest'
import SiteMaintenancePage from 'src/pages/SiteMaintenancePage.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('SiteMaintenancePage', () => {
  it('renders the maintenance copy and preview tiles', () => {
    const wrapper = mountWithApp(SiteMaintenancePage)

    expect(wrapper.text()).toContain('Maintenance mode')
    expect(wrapper.text()).toContain('We’re polishing the experience')
    expect(wrapper.find('.site-maintenance__preview').exists()).toBe(true)
    expect(wrapper.findAll('.site-maintenance__preview-skeleton')).toHaveLength(5)
  })

  it('renders the maintenance copy in Lithuanian', () => {
    const wrapper = mountWithApp(SiteMaintenancePage, { locale: 'lt-LT' })

    expect(wrapper.text()).toContain('Techninė priežiūra')
    expect(wrapper.text()).toContain('Tobuliname naudojimo patirtį')
    expect(wrapper.findAll('.site-maintenance__preview-skeleton')).toHaveLength(5)
  })
})
