import { describe, expect, it } from 'vitest'
import DecorativePlaceholderTile from 'src/components/DecorativePlaceholderTile.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('DecorativePlaceholderTile', () => {
  it('renders a decorative tile with the provided background image', () => {
    const backgroundImage = 'linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))'
    const wrapper = mountWithApp(DecorativePlaceholderTile, {
      props: { backgroundImage }
    })

    expect(wrapper.classes()).toContain('q-card')
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain('--tile-background')
    expect(wrapper.attributes('style')).toContain(backgroundImage)
  })
})
