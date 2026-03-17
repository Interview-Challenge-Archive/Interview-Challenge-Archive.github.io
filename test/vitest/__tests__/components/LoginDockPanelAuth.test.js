import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import appConfig from 'src/config/config.yml'
import LoginDockPanel from 'src/components/dock-panels/LoginDockPanel.vue'
import { useSessionStore } from 'src/stores/session-store'
import { mountWithApp } from '../../helpers/mount-with-app'

function findButtonByLabel (wrapper, label) {
  return wrapper.findAllComponents({ name: 'QBtn' })
    .find((button) => button.props('label') === label)
}

describe('LoginDockPanel auth flow', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('opens the GitHub OAuth popup and stores the returned session payload', async () => {
    const pinia = createPinia()
    const popup = {
      closed: false,
      close: vi.fn()
    }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(popup)

    setActivePinia(pinia)

    const wrapper = mountWithApp(LoginDockPanel, { pinia })
    const githubButton = findButtonByLabel(wrapper, 'Login with GitHub')

    githubButton.vm.$emit('click')
    await nextTick()

    expect(openSpy).toHaveBeenCalledTimes(1)
    const [popupUrl, popupName] = openSpy.mock.calls[0]
    const parsedUrl = new URL(popupUrl)

    expect(`${parsedUrl.origin}${parsedUrl.pathname}`).toBe(appConfig.auth.providers.github.loginUrl)
    expect(parsedUrl.searchParams.get('mode')).toBe('popup')
    expect(parsedUrl.searchParams.get('origin')).toBe(window.location.origin)
    expect(popupName).toBe(appConfig.auth.popup.name)

    window.dispatchEvent(new MessageEvent('message', {
      origin: appConfig.auth.serviceOrigin,
      data: {
        source: appConfig.auth.messageSource,
        type: 'oauth-complete',
        ok: true,
        payload: {
          provider: 'github',
          accessToken: 'github-access-token',
          tokenType: 'Bearer',
          scope: 'read:user user:email',
          authenticatedAt: '2026-03-17T10:00:00.000Z',
          user: {
            login: 'octocat',
            name: 'The Octocat',
            avatar_url: 'https://avatars.example/octocat.png'
          }
        }
      }
    }))
    await nextTick()

    const sessionStore = useSessionStore(pinia)

    expect(sessionStore.isAuthenticated).toBe(true)
    expect(sessionStore.provider).toBe('github')
    expect(sessionStore.accessToken).toBe('github-access-token')
    expect(sessionStore.displayName).toBe('The Octocat')
    expect(wrapper.text()).toContain('Connected with GitHub.')
    expect(wrapper.text()).toContain('The Octocat')
    expect(popup.close).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })
})
