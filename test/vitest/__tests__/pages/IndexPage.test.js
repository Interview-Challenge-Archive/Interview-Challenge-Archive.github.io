import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import IndexPage from 'src/pages/IndexPage.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

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
  beforeEach(() => {
    mockRoute.query = {}
    routerPush.mockReset()
    vi.restoreAllMocks()

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

    const wrapper = mountWithApp(IndexPage)
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

    const wrapper = mountWithApp(IndexPage)

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

    const wrapper = mountWithApp(IndexPage)
    await nextTick()

    expect(wrapper.findAll('.home-tiles > .home-project-tile')).toHaveLength(1)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile')).toHaveLength(3)
  })

  it('keeps the unified grid filled on wider viewports', async () => {
    mockRoute.query = {
      label: 'Vue 3'
    }
    setViewport(1280, 900, '460px 460px')

    const wrapper = mountWithApp(IndexPage)
    await nextTick()

    expect(wrapper.findAll('.home-tiles > .home-project-tile')).toHaveLength(1)
    expect(wrapper.findAll('.home-tiles > .decorative-placeholder-tile')).toHaveLength(5)
  })
})
