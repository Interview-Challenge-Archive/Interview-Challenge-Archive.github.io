import { flushPromises } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ProjectDetailPage from 'src/pages/ProjectDetailPage.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

const { mockRoute, routerPush, routerBack } = vi.hoisted(() => ({
  mockRoute: {
    params: {
      owner: 'mekdrop',
      repo: 'frontend-interview-tracks'
    }
  },
  routerPush: vi.fn(),
  routerBack: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    push: routerPush,
    back: routerBack
  })
}))

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    mockRoute.params = {
      owner: 'mekdrop',
      repo: 'frontend-interview-tracks'
    }
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
})