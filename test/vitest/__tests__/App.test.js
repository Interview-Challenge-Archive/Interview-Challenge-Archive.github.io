import { describe, expect, it } from 'vitest'
import App from 'src/App.vue'
import { mountWithApp } from '../helpers/mount-with-app'

describe('App', () => {
  it('renders the router view', () => {
    const wrapper = mountWithApp(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<div data-test="router-view" />'
          }
        }
      }
    })

    expect(wrapper.find('[data-test="router-view"]').exists()).toBe(true)
  })
})
