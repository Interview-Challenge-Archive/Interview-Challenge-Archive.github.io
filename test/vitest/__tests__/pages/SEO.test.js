import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useMeta } from 'quasar'
import IndexPage from 'src/pages/IndexPage.vue'
import ProjectDetailPage from 'src/pages/ProjectDetailPage.vue'
import ErrorNotFound from 'src/pages/ErrorNotFound.vue'
import SiteMaintenancePage from 'src/pages/SiteMaintenancePage.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

const { mockRoute } = vi.hoisted(() => ({
  mockRoute: {
    query: {},
    params: {},
    fullPath: '/'
  }
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn()
  })
}))

describe('SEO Metadata', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useMeta.mockClear()
    mockRoute.query = {}
    mockRoute.params = {}
    mockRoute.fullPath = '/'
  })

  it('sets correct metadata for IndexPage', async () => {
    mountWithApp(IndexPage)
    await flushPromises()

    expect(useMeta).toHaveBeenCalled()
    const metaFn = useMeta.mock.calls[0][0]
    const meta = metaFn()

    expect(meta.title).toBe('Interview Challenge Archive')
    expect(meta.meta.description.content).toBe('Browse practical UI exercises, framework prompts, and implementation walkthroughs.')
  })

  it('updates metadata on IndexPage when searching', async () => {
    mockRoute.query = { query: 'test', label: 'Vue 3' }
    mountWithApp(IndexPage)
    await flushPromises()

    const metaFn = useMeta.mock.calls[0][0]
    const meta = metaFn()

    expect(meta.title).toContain('Search for "test" in Vue 3')
    expect(meta.meta.description.content).toContain('Showing')
  })

  it('sets correct metadata for ProjectDetailPage', async () => {
    mockRoute.params = { owner: 'mekdrop', repo: 'frontend-interview-tracks' }
    mountWithApp(ProjectDetailPage)
    await flushPromises()

    expect(useMeta).toHaveBeenCalled()
    const metaFn = useMeta.mock.calls[0][0]
    const meta = metaFn()

    expect(meta.title).toBe('Frontend interview tracks | Interview Challenge Archive')
    expect(meta.meta.description.content).toBe('Browse practical UI exercises, framework prompts, and implementation walkthroughs.')
  })

  it('sets correct metadata for ErrorNotFound page', async () => {
    mountWithApp(ErrorNotFound)
    await flushPromises()

    expect(useMeta).toHaveBeenCalled()
    const metaFn = useMeta.mock.calls[0][0]
    const meta = metaFn()

    expect(meta.title).toBe('Page not found - 404 | Interview Challenge Archive')
    expect(meta.meta.robots.content).toBe('noindex, follow')
  })

  it('sets correct metadata for SiteMaintenancePage', async () => {
    mountWithApp(SiteMaintenancePage)
    await flushPromises()

    expect(useMeta).toHaveBeenCalled()
    const metaFn = useMeta.mock.calls[0][0]
    const meta = metaFn()

    expect(meta.title).toBe('We are polishing the experience | Interview Challenge Archive')
    expect(meta.meta.robots.content).toBe('noindex, nofollow')
  })
})
