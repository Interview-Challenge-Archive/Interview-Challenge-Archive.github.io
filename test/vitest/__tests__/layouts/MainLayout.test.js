import { afterEach, describe, expect, it, vi } from 'vitest'
import MainLayout from 'src/layouts/MainLayout.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

const { routeState } = vi.hoisted(() => ({
  routeState: { query: {} }
}))

vi.mock('quasar', async () => {
  const actual = await vi.importActual('quasar')

  return {
    ...actual,
    useQuasar: () => ({ screen: { lt: { sm: false } } })
  }
})

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')

  return {
    ...actual,
    useRoute: () => ({ query: routeState.query })
  }
})

function mountLayout (query = {}) {
  routeState.query = query

  return mountWithApp(MainLayout, {
    global: {
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        RouterView: true,
        SearchDockPanel: true,
        SubmitDockPanel: true,
        LoginDockPanel: true,
        AboutDockPanel: true
      }
    }
  })
}

describe('MainLayout', () => {
  afterEach(() => {
    routeState.query = {}
  })

  it('shows a fixed close button inside the opened desktop panel', async () => {
    const wrapper = mountLayout()
    const [searchTab] = wrapper.findAll('.bottom-dock__tab')

    expect(wrapper.find('.bottom-dock__panel-close').exists()).toBe(false)

    await searchTab.trigger('click')

    expect(wrapper.find('.bottom-dock__panel-close').exists()).toBe(true)
    expect(searchTab.find('.bottom-dock__tab-close').exists()).toBe(false)
  })

  it('does not show the panel close button for a preferred but unopened tab', () => {
    const wrapper = mountLayout({ query: 'vue' })

    expect(wrapper.find('.bottom-dock__tab--active').exists()).toBe(true)
    expect(wrapper.find('.bottom-dock__panel-close').exists()).toBe(false)
  })
})
