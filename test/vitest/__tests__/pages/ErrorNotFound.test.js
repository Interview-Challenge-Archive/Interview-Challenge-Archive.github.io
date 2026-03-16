import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { useMeta } from 'quasar'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

const { mockRoute } = vi.hoisted(() => ({
  mockRoute: {
    query: {},
    path: '/not-found'
  }
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute
}))

describe('ErrorNotFound', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockRoute.path = '/not-found'
    useMeta.mockClear()
  })

  it('renders the 404 heading and description', () => {
    const wrapper = mountWithApp(ErrorNotFound)

    expect(wrapper.html()).toContain('404')
    expect(wrapper.html()).toContain('Page not found')
    expect(wrapper.html()).toContain('The page you are looking for does not exist')
  })

  it('renders a home button', () => {
    const wrapper = mountWithApp(ErrorNotFound)

    const homeButton = wrapper.find('.error-not-found__action')
    expect(homeButton.exists()).toBe(true)
    expect(homeButton.text()).toContain('Go Home')
  })

  it('restores original URL from query params on mount', async () => {
    const replaceStateSpy = vi.fn()
    const originalReplaceState = window.history.replaceState
    window.history.replaceState = replaceStateSpy

    mockRoute.query = {
      path: '/projects/mekdrop/nonexistent-project'
    }

    mountWithApp(ErrorNotFound)

    // Wait for onMounted to execute
    await flushPromises()

    expect(replaceStateSpy).toHaveBeenCalledWith(
      {},
      '',
      '/projects/mekdrop/nonexistent-project'
    )

    window.history.replaceState = originalReplaceState
  })

  it('does not call replaceState when no query path is provided', async () => {
    const replaceStateSpy = vi.fn()
    const originalReplaceState = window.history.replaceState
    window.history.replaceState = replaceStateSpy

    mockRoute.query = {}

    mountWithApp(ErrorNotFound)

    await flushPromises()

    expect(replaceStateSpy).not.toHaveBeenCalled()

    window.history.replaceState = originalReplaceState
  })

  it('renders the brand header with app title', () => {
    const wrapper = mountWithApp(ErrorNotFound)

    expect(wrapper.html()).toContain('Interview Challenge Archive')
    expect(wrapper.find('.error-not-found__brand').exists()).toBe(true)
  })

  it('renders the preview section with loading skeleton tiles', () => {
    const wrapper = mountWithApp(ErrorNotFound)

    expect(wrapper.find('.error-not-found__preview').exists()).toBe(true)
    expect(wrapper.find('.error-not-found__preview-grid').exists()).toBe(true)
    expect(wrapper.findAll('.error-not-found__preview-grid > *')).toHaveLength(4)
  })

  it('has proper accessibility attributes', () => {
    const wrapper = mountWithApp(ErrorNotFound)

    expect(wrapper.find('.error-not-found__backdrop').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.error-not-found__wash').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.error-not-found__visual').attributes('aria-hidden')).toBe('true')
  })

  describe('SEO Metadata', () => {
    it('sets correct metadata with noindex', async () => {
      mountWithApp(ErrorNotFound)
      await flushPromises()

      expect(useMeta).toHaveBeenCalled()
      const metaFn = useMeta.mock.calls[0][0]
      const meta = metaFn()

      expect(meta.title).toBe('Page not found - 404 | Interview Challenge Archive')
      expect(meta.meta.robots.content).toBe('noindex, follow')
    })
  })
})
