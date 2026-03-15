import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import IndexPage from 'src/pages/IndexPage.vue'
import { mountWithApp } from '../../helpers/mount-with-app'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'

const { mockRoute, routerPush } = vi.hoisted(() => ({
  mockRoute: { query: {} },
  routerPush: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: routerPush })
}))

const nativeGetComputedStyle = window.getComputedStyle.bind(window)

function mockGridTemplateColumns (gridTemplateColumns) {
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
    const style = nativeGetComputedStyle(element)

    if (element instanceof HTMLElement && element.classList.contains('home-tiles')) {
      Object.defineProperty(style, 'gridTemplateColumns', {
        value: gridTemplateColumns,
        configurable: true
      })
    }

    return style
  })
}

function setViewport (width, height, gridTemplateColumns) {
  Object.defineProperty(window, 'innerWidth', {
    value: width,
    configurable: true,
    writable: true
  })
  Object.defineProperty(window, 'innerHeight', {
    value: height,
    configurable: true,
    writable: true
  })

  mockGridTemplateColumns(gridTemplateColumns)
}

describe('IndexPage', () => {
  let pinia

  beforeEach(async () => {
    pinia = createPinia()
    setActivePinia(pinia)

    mockRoute.query = {}
    routerPush.mockReset()
    vi.restoreAllMocks()

    // Initialize store for each test to ensure items are loaded
    const store = useGitHubProjectsStore()
    // By default, it uses a real but small catalog and a 420ms delay.
    // We can mock the delay or just wait.
    vi.mock('src/stores/github-projects-store', async (importOriginal) => {
      const actual = await importOriginal()
      return {
        ...actual,
        PROJECTS_LOAD_DELAY_MS: 0
      }
    })

    Object.defineProperty(window, 'innerWidth', {
      value: 1280,
      configurable: true,
      writable: true
    })
    Object.defineProperty(window, 'innerHeight', {
      value: 900,
      configurable: true,
      writable: true
    })
    mockGridTemplateColumns('460px 460px')
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      width: 0,
      height: 0,
      toJSON: () => ({})
    }))
  })

  it('filters home tiles by language labels from the route query', () => {
    mockRoute.query = {
      label: 'Vue 3'
    }

    const wrapper = mountWithApp(IndexPage, { pinia })
    const tileCards = wrapper.findAll('.home-tile--action')
    const tileTitles = tileCards.map((tile) => tile.text())

    expect(tileTitles).toHaveLength(1)
    expect(tileCards[0].classes()).toContain('q-card')
    expect(tileTitles[0]).toContain('Frontend interview tracks')
    expect(wrapper.text()).not.toContain('System design vault')
    expect(wrapper.text()).not.toContain('Coding challenge sets')
    expect(wrapper.text()).not.toContain('Company-specific notes')
  })

  it('renders decorative placeholder tiles inside the main grid instead of a second layer', () => {
    mockRoute.query = {
      label: 'Vue 3'
    }

    const wrapper = mountWithApp(IndexPage, { pinia })

    expect(wrapper.findAll('.home-tiles')).toHaveLength(1)
    expect(wrapper.find('.home-tiles--placeholder-layer').exists()).toBe(false)
    expect(wrapper.find('.home-tiles > .home-project-tile').exists()).toBe(true)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile').length).toBeGreaterThan(0)
  })

  it('keeps the unified grid filled on narrow viewports', async () => {
    mockRoute.query = {
      label: 'Vue 3'
    }
    setViewport(390, 900, '390px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(wrapper.findAll('.home-tiles > .home-project-tile')).toHaveLength(1)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile')).toHaveLength(3)
  })

  it('keeps the unified grid filled on wider viewports', async () => {
    mockRoute.query = {
      label: 'Vue 3'
    }
    setViewport(1280, 900, '460px 460px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(wrapper.findAll('.home-tiles > .home-project-tile')).toHaveLength(1)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile')).toHaveLength(5)
  })

  it('hides scrollbar when last row is entirely decorative and fits viewport', async () => {
    // 2 rows of content (4 tiles at 2 cols) fits in 900px height (tileHeight is ~300px)
    mockRoute.query = { query: 'Frontend' } // Matches 1 project
    setViewport(1280, 900, '460px 460px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    // 1 project + 5 placeholders = 6 tiles (3 rows)
    // contentHeight = 1 row * ~300px = 300px. fits in 900px - 64px = 836px.
    expect(document.body.classList.contains('no-scroll')).toBe(true)
  })

  it('shows scrollbar when real content exceeds viewport', async () => {
    // Force small height so 1 project row + padding might exceed it
    // 1 row * 400px (max height) = 400px.
    setViewport(1280, 300, '460px 460px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(document.body.classList.contains('no-scroll')).toBe(false)
  })

  it('only fills the last row with placeholders when content scrolls', async () => {
    // 1 column. 1 project. 
    // tileHeight = 240 (for narrow viewports). contentHeightActual = 1 * 240 = 240.
    // viewportHeight = 200. availableViewportHeight = 200 - 0 - 64 = 136.
    // shouldScrollForContent should be true.
    
    setViewport(390, 200, '390px') // 1 column
    
    const wrapper = mountWithApp(IndexPage, { pinia })
    const store = useGitHubProjectsStore()
    
    store.items = [
      { id: 'p1', title: 'P1', type: 'project', projectPath: 'p1', subtitle: 'S1', backgroundImage: 'B1' }
    ]
    store.hasInitialized = true
    
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(390)
    mockGridTemplateColumns('390px')
    
    wrapper.vm.updatePageMetrics()
    await nextTick()
    await nextTick()

    const projects = wrapper.findAll('.home-project-tile').length
    const placeholders = wrapper.findAll('.decorative-placeholder-tile').length
    
    // projects = 1. visibleColumnCount = 1. 
    // It should complete the last row. (1 - (1 % 1)) % 1 = 0.
    expect(placeholders).toBe(0)
  })

  it('hides load more sentinel when scrollbar is hidden', async () => {
    // Force a state where scrollbar is hidden
    mockRoute.query = { query: 'Frontend' } // 1 project
    setViewport(1280, 900, '460px 460px') // 2 columns
    
    const wrapper = mountWithApp(IndexPage, { pinia })
    const store = useGitHubProjectsStore()
    
    store.items = [{ id: 'p1', title: 'P1', type: 'project' }]
    store.hasInitialized = true
    
    await nextTick()
    await nextTick()

    expect(document.body.classList.contains('no-scroll')).toBe(true)
    expect(wrapper.find('.home-tiles__sentinel').exists()).toBe(false)
  })
})
