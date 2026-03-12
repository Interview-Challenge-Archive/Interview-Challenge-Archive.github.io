import { describe, expect, it } from 'vitest'
import LoadingSkeletonTile from 'src/components/home-tiles/LoadingSkeletonTile.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('LoadingSkeletonTile', () => {
  it('renders four skeleton placeholders on the provided background', () => {
    const backgroundImage = 'linear-gradient(rgb(10, 10, 10), rgb(20, 20, 20))'
    const wrapper = mountWithApp(LoadingSkeletonTile, {
      props: { backgroundImage }
    })

    expect(wrapper.classes()).toContain('q-card')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain(backgroundImage)
    expect(wrapper.findAll('.q-skeleton')).toHaveLength(4)
    expect(wrapper.find('.loading-skeleton-tile__line--title').exists()).toBe(true)
    expect(wrapper.find('.loading-skeleton-tile__line--subtitle-short').exists()).toBe(true)
  })
})
