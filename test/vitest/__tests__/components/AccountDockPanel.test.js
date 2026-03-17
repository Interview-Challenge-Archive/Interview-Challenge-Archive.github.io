import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
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
})
