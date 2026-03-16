import { describe, expect, it } from 'vitest'
import LoadingSkeletonTile from 'src/components/home-tiles/LoadingSkeletonTile.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('LoadingSkeletonTile', () => {
  it('renders four skeleton placeholders', () => {
    const wrapper = mountWithApp(LoadingSkeletonTile)

    expect(wrapper.classes()).toContain('q-card')
    expect(wrapper.attributes('aria-hidden')).toBe('false')
    expect(wrapper.attributes('style')).toContain('--tile-background')
    expect(wrapper.findAll('.q-skeleton')).toHaveLength(4)
    expect(wrapper.find('.loading-skeleton-tile__line--title').exists()).toBe(true)
    expect(wrapper.find('.loading-skeleton-tile__line--subtitle-short').exists()).toBe(true)
  })
})
