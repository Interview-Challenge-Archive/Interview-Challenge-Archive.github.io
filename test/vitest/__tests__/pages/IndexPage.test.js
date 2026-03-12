import { beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('IndexPage', () => {
  beforeEach(() => {
    mockRoute.query = {}
    routerPush.mockReset()
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
})
