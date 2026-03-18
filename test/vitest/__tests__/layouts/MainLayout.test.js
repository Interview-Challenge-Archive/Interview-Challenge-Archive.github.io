import { afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import MainLayout from 'src/layouts/MainLayout.vue'
import { useSessionStore } from 'src/stores/session-store'
import { mountWithApp } from '../../helpers/mount-with-app'

const { routeState, routerReplace } = vi.hoisted(() => ({
  routeState: { query: {} },
  routerReplace: vi.fn()
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
    useRoute: () => ({ query: routeState.query }),
    useRouter: () => ({ replace: routerReplace })
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
        SubmissionsDockPanel: true,
        LoginDockPanel: true,
        AccountDockPanel: true,
        AboutDockPanel: true
      }
    }
  })
}

function createAuthenticatedPinia () {
  const pinia = createPinia()

  setActivePinia(pinia)
  const sessionStore = useSessionStore(pinia)

  sessionStore.setSession({
    provider: 'github',
    accessToken: 'github-access-token',
    user: {
      login: 'octocat',
      name: 'The Octocat'
    }
  })

  return pinia
}

describe('MainLayout', () => {
  afterEach(() => {
    routeState.query = {}
    routerReplace.mockReset()
    document.body.classList.remove('home-search-dock-expanded')
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

  it('opens the requested dock tab from route query', async () => {
    const wrapper = mountLayout({ openTab: 'search' })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.bottom-dock__panel-close').exists()).toBe(true)
    expect(document.body.classList.contains('home-search-dock-expanded')).toBe(true)
  })

  it('removes openTab query when the tab is closed', async () => {
    const wrapper = mountLayout({ openTab: 'search', query: 'vue' })

    await wrapper.vm.$nextTick()
    await wrapper.find('.bottom-dock__panel-close').trigger('click')

    expect(routerReplace).toHaveBeenCalledWith({
      query: { query: 'vue' }
    })
  })

  it('shows Login tab and hides Account tab for unauthenticated users', () => {
    const wrapper = mountLayout()
    const tabLabels = wrapper.findAll('.bottom-dock__tab-label').map((node) => node.text())

    expect(tabLabels).toContain('Login')
    expect(tabLabels).not.toContain('Account')
  })

  it('shows Account tab and hides Login tab for authenticated users', () => {
    const pinia = createAuthenticatedPinia()
    const wrapper = mountWithApp(MainLayout, {
      pinia,
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          RouterView: true,
          SearchDockPanel: true,
          SubmissionsDockPanel: true,
          LoginDockPanel: true,
          AccountDockPanel: true,
          AboutDockPanel: true
        }
      }
    })
    const tabLabels = wrapper.findAll('.bottom-dock__tab-label').map((node) => node.text())

    expect(tabLabels).toContain('Account')
    expect(tabLabels).not.toContain('Login')
  })
})
