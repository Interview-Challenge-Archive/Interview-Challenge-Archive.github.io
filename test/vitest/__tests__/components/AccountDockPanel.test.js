import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import appConfig from 'src/config/auth.yml'
import AccountDockPanel from 'src/components/dock-panels/AccountDockPanel.vue'
import { useSessionStore } from 'src/stores/session-store'
import { mountWithApp } from '../../helpers/mount-with-app'

function seedConnectedAccount (sessionStore, { provider, login, name, accessToken }) {
  sessionStore.setSession({
    provider,
    accessToken,
    tokenType: 'Bearer',
    authenticatedAt: '2026-03-17T10:00:00.000Z',
    user: {
      login,
      name
    }
  })
}

describe('AccountDockPanel', () => {
  beforeEach(() => {
    window.localStorage.clear()
    window.sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('disconnects only the selected account row', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    const sessionStore = useSessionStore(pinia)
    seedConnectedAccount(sessionStore, {
      provider: 'github',
      login: 'octocat',
      name: 'The Octocat',
      accessToken: 'github-token'
    })
    seedConnectedAccount(sessionStore, {
      provider: 'linkedin',
      login: 'lin-user',
      name: 'Linked In',
      accessToken: 'linkedin-token'
    })

    const wrapper = mountWithApp(AccountDockPanel, { pinia })
    const githubRow = wrapper.findAll('.account-dock-panel__row')
      .find((row) => row.text().includes('GitHub'))
    const githubDisconnectButton = githubRow?.findAllComponents({ name: 'QBtn' })
      .find((button) => button.props('label') === 'Disconnect')

    await githubDisconnectButton?.vm.$emit('click')

    expect(Object.keys(sessionStore.accounts)).toHaveLength(1)
    expect(Object.keys(sessionStore.accounts)[0]).toContain('linkedin:')
  })

  it('logs out all accounts when global logout is clicked', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    const sessionStore = useSessionStore(pinia)
    seedConnectedAccount(sessionStore, {
      provider: 'github',
      login: 'octocat',
      name: 'The Octocat',
      accessToken: 'github-token'
    })

    const wrapper = mountWithApp(AccountDockPanel, { pinia })
    const logoutButton = wrapper.findAllComponents({ name: 'QBtn' })
      .find((button) => button.props('label') === 'Logout')

    await logoutButton?.vm.$emit('click')

    expect(Object.keys(sessionStore.accounts)).toHaveLength(0)
    expect(sessionStore.isAuthenticated).toBe(false)
  })

  it('does not duplicate provider rows when provider account exists but is expired', () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    const sessionStore = useSessionStore(pinia)
    sessionStore.setSession({
      provider: 'linkedin',
      accessToken: 'expired-linkedin-token',
      tokenType: 'Bearer',
      expiresIn: 60,
      authenticatedAt: '2020-01-01T00:00:00.000Z',
      user: {
        email: 'old@example.com',
        name: 'Old LinkedIn'
      }
    })

    const wrapper = mountWithApp(AccountDockPanel, { pinia })
    const linkedinRows = wrapper.findAll('.account-dock-panel__row')
      .filter((row) => row.text().includes('LinkedIn'))

    expect(linkedinRows).toHaveLength(1)
  })

  it('shows connect action for an expired provider account row', () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    const sessionStore = useSessionStore(pinia)
    sessionStore.setSession({
      provider: 'linkedin',
      accessToken: 'expired-linkedin-token',
      tokenType: 'Bearer',
      expiresIn: 60,
      authenticatedAt: '2020-01-01T00:00:00.000Z',
      user: {
        email: 'old@example.com',
        name: 'Old LinkedIn'
      }
    })

    const wrapper = mountWithApp(AccountDockPanel, { pinia })
    const linkedinRow = wrapper.findAll('.account-dock-panel__row')
      .find((row) => row.text().includes('LinkedIn'))
    const actionButton = linkedinRow?.findAllComponents({ name: 'QBtn' })[0]

    expect(actionButton?.props('label')).toBe('Connect')
  })

  it('passes GitHub scope in OAuth popup query params when connecting', async () => {
    const pinia = createPinia()
    const popup = {
      closed: false,
      close: vi.fn()
    }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(popup)

    setActivePinia(pinia)
    const wrapper = mountWithApp(AccountDockPanel, { pinia })
    const githubRow = wrapper.findAll('.account-dock-panel__row')
      .find((row) => row.text().includes('GitHub'))
    const connectButton = githubRow?.findAllComponents({ name: 'QBtn' })
      .find((button) => button.props('label') === 'Connect')

    await connectButton?.vm.$emit('click')
    await nextTick()

    expect(openSpy).toHaveBeenCalledTimes(1)
    const [popupUrl] = openSpy.mock.calls[0]
    const parsedUrl = new URL(popupUrl)

    expect(`${parsedUrl.origin}${parsedUrl.pathname}`).toBe(appConfig.auth.providers.github.loginUrl)
    expect(parsedUrl.searchParams.get('scope')).toBe('read:user user:email read:org')

    wrapper.unmount()
  })
})
