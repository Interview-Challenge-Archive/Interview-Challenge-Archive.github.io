import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useMeta } from 'quasar'
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
    useMeta.mockClear()
    vi.restoreAllMocks()

    const store = useGitHubProjectsStore()
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

  it('shows an empty-state message when active filters return no projects', async () => {
    mockRoute.query = {
      query: 'non-existent-project'
    }

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(wrapper.text()).toContain('Nothing found for this search')
    expect(wrapper.findAll('.home-project-tile')).toHaveLength(0)
    expect(wrapper.findAll('.decorative-placeholder-tile:not(.loading-skeleton-tile)').length).toBeGreaterThan(0)
    expect(wrapper.find('.home-tiles__sentinel').exists()).toBe(false)

    const emptyActions = wrapper.findAll('.index-page__empty-state-markdown a')

    expect(emptyActions).toHaveLength(2)

    await emptyActions[0].trigger('click')
    expect(routerPush).toHaveBeenLastCalledWith({
      name: 'home',
      query: {
        query: 'non-existent-project',
        openTab: 'search'
      }
    })

    await emptyActions[1].trigger('click')
    expect(routerPush).toHaveBeenLastCalledWith({ name: 'home' })
  })

  it('renders decorative placeholder tiles inside the main grid instead of a second layer', () => {
    mockRoute.query = {
      label: 'Vue 3'
    }

    const wrapper = mountWithApp(IndexPage, { pinia })

    expect(wrapper.findAll('.home-tiles')).toHaveLength(1)
    expect(wrapper.find('.home-tiles--placeholder-layer').exists()).toBe(false)
    expect(wrapper.find('.home-tiles > .home-project-tile').exists()).toBe(true)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile:not(.loading-skeleton-tile)').length).toBeGreaterThan(0)
  })

  it('keeps the unified grid filled on narrow viewports', async () => {
    mockRoute.query = {
      label: 'Vue 3'
    }
    setViewport(390, 900, '390px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(wrapper.findAll('.home-tiles > .home-project-tile')).toHaveLength(1)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile:not(.loading-skeleton-tile)')).toHaveLength(3)
  })

  it('keeps the unified grid filled on wider viewports', async () => {
    mockRoute.query = {
      label: 'Vue 3'
    }
    setViewport(1280, 900, '460px 460px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(wrapper.findAll('.home-tiles > .home-project-tile')).toHaveLength(1)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile:not(.loading-skeleton-tile)')).toHaveLength(5)
  })

  it('hides scrollbar when last row is entirely decorative and fits viewport', async () => {
    mockRoute.query = { query: 'Frontend' }
    setViewport(1280, 900, '460px 460px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(document.body.classList.contains('no-scroll')).toBe(true)
  })

  it('shows scrollbar when real content exceeds viewport', async () => {
    setViewport(1280, 300, '460px 460px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    await nextTick()

    expect(document.body.classList.contains('no-scroll')).toBe(false)
  })

  it('only fills the last row with placeholders when content scrolls', async () => {
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
    const placeholders = wrapper.findAll('.decorative-placeholder-tile:not(.loading-skeleton-tile)').length

    expect(placeholders).toBe(0)
  })

  it('hides load more sentinel when scrollbar is hidden', async () => {
    mockRoute.query = { query: 'Frontend' }
    setViewport(1280, 900, '460px 460px')

    const wrapper = mountWithApp(IndexPage, { pinia })
    const store = useGitHubProjectsStore()

    store.items = [{ id: 'p1', title: 'P1', type: 'project' }]
    store.hasInitialized = true

    await nextTick()
    await nextTick()

    expect(document.body.classList.contains('no-scroll')).toBe(true)
    expect(wrapper.find('.home-tiles__sentinel').exists()).toBe(false)
  })

  describe('SEO Metadata', () => {
    it('sets correct initial metadata', async () => {
      mountWithApp(IndexPage, { pinia })
      await flushPromises()

      expect(useMeta).toHaveBeenCalled()
      const metaFn = useMeta.mock.calls[0][0]
      const meta = metaFn()

      expect(meta.title).toBe('Interview Challenge Archive')
      expect(meta.meta.description.content).toBe('Browse practical UI exercises, framework prompts, and implementation walkthroughs.')
    })

    it('updates metadata when searching', async () => {
      mockRoute.query = { query: 'test', label: 'Vue 3' }
      mountWithApp(IndexPage, { pinia })
      await flushPromises()

      const metaFn = useMeta.mock.calls[0][0]
      const meta = metaFn()

      expect(meta.title).toContain('Search for "test" in Vue 3')
      expect(meta.meta.description.content).toContain('Showing')
    })
  })
})
