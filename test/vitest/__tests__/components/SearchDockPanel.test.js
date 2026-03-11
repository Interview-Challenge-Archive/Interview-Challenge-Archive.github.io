import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import SearchDockPanel from 'src/components/dock-panels/SearchDockPanel.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

const { mockRoute, routerPush } = vi.hoisted(() => ({
  mockRoute: { query: {} },
  routerPush: vi.fn()
}))

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ push: routerPush })
}))

function mountSearchDockPanel () {
  return mountWithApp(SearchDockPanel)
}

function findButtonByLabel (wrapper, label) {
  return wrapper.findAllComponents({ name: 'QBtn' })
    .find((button) => button.props('label') === label)
}

describe('SearchDockPanel', () => {
  beforeEach(() => {
    mockRoute.query = {}
    routerPush.mockReset()
    routerPush.mockResolvedValue(undefined)
  })

  it('initializes its fields from the current route query', async () => {
    mockRoute.query = {
      query: ' Vue  ',
      label: ['UI', 'Accessibility', 'UI', '']
    }

    const wrapper = mountSearchDockPanel()
    await nextTick()

    const queryInput = wrapper.findComponent({ name: 'QInput' })
    const labelSelect = wrapper.findComponent({ name: 'QSelect' })

    expect(queryInput.props('modelValue')).toBe('Vue')
    expect(labelSelect.props('modelValue')).toEqual(['UI', 'Accessibility'])
    expect(labelSelect.props('options').slice(0, 3)).toEqual(['Accessibility', 'Algorithms', 'Animations'])
  })

  it('filters label options from the store catalog', async () => {
    const wrapper = mountSearchDockPanel()
    const labelSelect = wrapper.findComponent({ name: 'QSelect' })
    const update = vi.fn((callback) => callback())

    labelSelect.vm.$emit('filter', 'hiri', update)
    await nextTick()

    expect(update).toHaveBeenCalledOnce()
    expect(labelSelect.props('options')).toEqual(['Hiring process', 'Hiring tasks'])
  })

  it('includes project languages in the selectable label options', () => {
    const wrapper = mountSearchDockPanel()
    const labelSelect = wrapper.findComponent({ name: 'QSelect' })

    expect(labelSelect.props('options')).toContain('Vue 3')
    expect(labelSelect.props('options')).toContain('JavaScript')
    expect(labelSelect.props('options')).toContain('Markdown')
  })

  it('submits a trimmed search query and unique labels', async () => {
    const wrapper = mountSearchDockPanel()
    const queryInput = wrapper.findComponent({ name: 'QInput' })
    const labelSelect = wrapper.findComponent({ name: 'QSelect' })
    const searchButton = findButtonByLabel(wrapper, 'Search')

    queryInput.vm.$emit('update:modelValue', ' system design ')
    labelSelect.vm.$emit('update:modelValue', ['Notes', 'Architecture', 'Notes', ''])
    await nextTick()

    searchButton.vm.$emit('click')
    await flushPromises()

    expect(routerPush).toHaveBeenCalledWith({
      name: 'home',
      query: {
        query: 'system design',
        label: ['Notes', 'Architecture']
      }
    })
    expect(wrapper.emitted('submitted')).toHaveLength(1)
  })

  it('resets the search state and navigates back home', async () => {
    mockRoute.query = {
      query: 'frontend',
      label: ['UI']
    }

    const wrapper = mountSearchDockPanel()
    await nextTick()

    const resetButton = findButtonByLabel(wrapper, 'Reset')
    const queryInput = wrapper.findComponent({ name: 'QInput' })
    const labelSelect = wrapper.findComponent({ name: 'QSelect' })

    resetButton.vm.$emit('click')
    await flushPromises()

    expect(queryInput.props('modelValue')).toBe('')
    expect(labelSelect.props('modelValue')).toEqual([])
    expect(routerPush).toHaveBeenCalledWith({ name: 'home' })
    expect(wrapper.emitted('submitted')).toHaveLength(1)
  })
})
