import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
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
})
