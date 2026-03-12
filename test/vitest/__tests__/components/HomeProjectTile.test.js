import { describe, expect, it } from 'vitest'
import HomeProjectTile from 'src/components/home-tiles/HomeProjectTile.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('HomeProjectTile', () => {
  it('renders as a q-card and emits selection events', async () => {
    const wrapper = mountWithApp(HomeProjectTile, {
      props: {
        projectPath: 'mekdrop/demo-project',
        title: 'Demo project',
        subtitle: 'A short project summary.',
        backgroundImage: 'linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))',
        transitionName: 'project-card-mekdrop-demo-project',
        ariaLabel: 'Open Demo project'
      }
    })

    expect(wrapper.classes()).toContain('q-card')
    expect(wrapper.attributes('role')).toBe('button')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.text()).toContain('mekdrop/demo-project')
    expect(wrapper.text()).toContain('Demo project')

    await wrapper.trigger('click')
    await wrapper.trigger('keydown.enter')

    expect(wrapper.emitted('select')).toHaveLength(2)
  })
})
