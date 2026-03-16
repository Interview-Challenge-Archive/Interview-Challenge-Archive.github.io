import { describe, expect, it } from 'vitest'
import DecorativePlaceholderTile from 'src/components/home-tiles/DecorativePlaceholderTile.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('DecorativePlaceholderTile', () => {
  it('renders a decorative tile with a generated background', () => {
    const wrapper = mountWithApp(DecorativePlaceholderTile)

    expect(wrapper.classes()).toContain('q-card')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--tile-background')
  })
})
