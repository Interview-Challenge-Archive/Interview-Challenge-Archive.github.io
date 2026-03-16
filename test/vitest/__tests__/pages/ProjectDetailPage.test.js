import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useMeta } from 'quasar'
import ProjectDetailPage from 'src/pages/ProjectDetailPage.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

const { mockRoute, routerReplace, routerPush, routerBack } = vi.hoisted(() => ({
  mockRoute: {
    params: {
      owner: 'mekdrop',
      repo: 'frontend-interview-tracks'
    },
    fullPath: '/projects/mekdrop/frontend-interview-tracks'
  },
  routerReplace: vi.fn(),
  routerPush: vi.fn(),
  routerBack: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: routerPush,
    replace: routerReplace,
    back: routerBack
  })
}))

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    mockRoute.params = {
      owner: 'mekdrop',
      repo: 'frontend-interview-tracks'
    }
    mockRoute.fullPath = '/projects/mekdrop/frontend-interview-tracks'
    routerReplace.mockReset()
    routerReplace.mockResolvedValue(undefined)
    routerPush.mockReset()
    routerPush.mockResolvedValue(undefined)
    routerBack.mockReset()
    useMeta.mockClear()
  })

  it('renders the primary language like the other clickable labels', async () => {
    const wrapper = mountWithApp(ProjectDetailPage)
    const [languageChip] = wrapper.findAllComponents({ name: 'QChip' })

    expect(languageChip.text()).toContain('Vue 3')
    expect(languageChip.props('clickable')).toBe(true)
    expect(languageChip.props('outline')).toBe(true)
    expect(languageChip.props('color')).toBe('grey-8')
    expect(languageChip.props('textColor')).toBe('grey-9')

    languageChip.vm.$emit('click')
    await flushPromises()

    expect(routerPush).toHaveBeenCalledWith({
      name: 'home',
      query: {
        label: 'Vue 3'
      }
    })
  })

  it('redirects to not-found route when project does not exist', async () => {
    // Set route params to non-existent project
    mockRoute.params = {
      owner: 'nonexistent',
      repo: 'project'
    }
    mockRoute.fullPath = '/projects/nonexistent/project'

    const wrapper = mountWithApp(ProjectDetailPage)

    // Wait for onMounted and async operations (ensureItemsLoaded has 420ms delay)
    await flushPromises()
    await new Promise(resolve => setTimeout(resolve, 500))

    // Should redirect to not-found route with original path
    expect(routerReplace).toHaveBeenCalledWith({
      name: 'not-found',
      query: {
        path: '/projects/nonexistent/project'
      }
    })
  })

  it('does not redirect when project exists', async () => {
    const wrapper = mountWithApp(ProjectDetailPage)

    // Wait for onMounted and async operations
    await flushPromises()

    // Should not redirect for valid project
    expect(routerReplace).not.toHaveBeenCalled()

    // Should render project content
    expect(wrapper.html()).toContain('Frontend interview tracks')
  })

  it('uses q-card utility classes to anchor the project poster controls and copy', () => {
    const wrapper = mountWithApp(ProjectDetailPage)
    const poster = wrapper.find('.project-detail__poster')

    expect(poster.classes()).toContain('q-card')
    expect(poster.classes()).toContain('relative-position')
    expect(wrapper.find('.project-detail__back-btn').classes()).toContain('absolute-top-left')
    expect(wrapper.find('.project-detail__poster-overlay').classes()).toContain('absolute-full')
    expect(wrapper.find('.project-detail__poster-copy').classes()).toContain('absolute-bottom')
  })

  describe('SEO Metadata', () => {
    it('sets correct metadata based on project data', async () => {
      mountWithApp(ProjectDetailPage)
      await flushPromises()

      expect(useMeta).toHaveBeenCalled()
      const metaFn = useMeta.mock.calls[0][0]
      const meta = metaFn()

      expect(meta.title).toBe('Frontend interview tracks | Interview Challenge Archive')
      expect(meta.meta.description.content).toBe('Browse practical UI exercises, framework prompts, and implementation walkthroughs.')
    })
  })
})
