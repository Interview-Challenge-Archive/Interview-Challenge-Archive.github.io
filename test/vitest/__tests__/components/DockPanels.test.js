import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import AboutDockPanel from 'src/components/dock-panels/AboutDockPanel.vue'
import AccountDockPanel from 'src/components/dock-panels/AccountDockPanel.vue'
import LoginDockPanel from 'src/components/dock-panels/LoginDockPanel.vue'
import SubmitDockPanel from 'src/components/dock-panels/SubmitDockPanel.vue'
import { useSessionStore } from 'src/stores/session-store'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('AboutDockPanel', () => {
  it('renders project overview, social links, author mention, and linked tools', () => {
    const wrapper = mountWithApp(AboutDockPanel)
    const socialLinks = wrapper.findAllComponents({ name: 'QBtn' })
    const aiToolLinks = wrapper.findAll('a.about-dock-panel__tool-link')
    const authorLinks = wrapper.findAll('a.about-dock-panel__author-link')

    expect(wrapper.text()).toContain('About Interview Challenge Archive')
    expect(wrapper.text()).toContain('Interview Challenge Archive is a public collection of take-home interview tasks')
    expect(wrapper.text()).toContain('designed to make them discoverable and searchable on GitHub')
    expect(wrapper.text()).toContain('The archive is especially useful for people who are just starting out')
    expect(wrapper.text()).toContain('Using AI during these assignments is acceptable')
    expect(wrapper.text()).toContain('The only requirement for inclusion is that the submission is made by the candidate')
    expect(wrapper.text()).toContain('The project started before AI coding assistants were something you could rely on every day')
    expect(wrapper.text()).toContain('At the time, @MekDrop was not thinking about monetization')
    expect(wrapper.text()).toContain('run almost entirely on GitHub infrastructure')
    expect(wrapper.text()).toContain('would have been simpler to build it on a more traditional setup')
    expect(wrapper.text()).toContain('the design took inspiration from Multiverse theme by HTML5 UP')
    expect(wrapper.text()).toContain('after adopting vibe coding')
    expect(wrapper.text()).toContain('interface was rebuilt piece by piece by asking AI tools')
    expect(wrapper.text()).toContain('This release also moved forward much faster, helped by')
    expect(wrapper.text()).toContain('Augmented')
    expect(wrapper.text()).toContain('Zencoder')
    expect(wrapper.text()).toContain('OpenCode')
    expect(wrapper.text()).toContain('@MekDrop')
    expect(wrapper.text()).not.toContain('github@mekdrop.name')
    expect(wrapper.text()).toContain('OpenAI Codex')
    expect(wrapper.text()).toContain('Qwen Code')
    expect(aiToolLinks).toHaveLength(8)
    expect(authorLinks).toHaveLength(1)
    expect(authorLinks.map((link) => link.attributes('href'))).toEqual([
      'https://github.com/MekDrop'
    ])
    expect(aiToolLinks.map((link) => link.attributes('href'))).toEqual([
      'https://github.com/Interview-Challenge-Archive',
      'https://www.linkedin.com/company/interview-challenge-archive/',
      'https://html5up.net/multiverse',
      'https://www.augmentcode.com/',
      'https://zencoder.ai/',
      'https://openai.com/codex/',
      'https://opencode.ai/',
      'https://github.com/QwenLM/qwen-code'
    ])
    expect(socialLinks.map((link) => link.props('icon'))).toEqual([
      'fa-brands fa-github',
      'fa-brands fa-linkedin'
    ])
  })
})

describe('LoginDockPanel', () => {
  it('renders OAuth actions for GitHub and LinkedIn', () => {
    const wrapper = mountWithApp(LoginDockPanel)
    const actions = wrapper.findAllComponents({ name: 'QBtn' })

    expect(wrapper.text()).toContain('Login to your account')
    expect(wrapper.text()).toContain('Connect GitHub or LinkedIn to keep your archive session in the current browser tab.')
    expect(actions.map((action) => action.props('label'))).toEqual([
      'GitHub',
      'LinkedIn'
    ])
    expect(actions.map((action) => action.props('icon'))).toEqual([
      'fa-brands fa-github',
      'fa-brands fa-linkedin'
    ])
  })
})

describe('AccountDockPanel', () => {
  it('renders connected accounts list with disconnect and connect actions', () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    const sessionStore = useSessionStore(pinia)
    sessionStore.setSession({
      provider: 'github',
      accessToken: 'github-access-token',
      user: {
        login: 'octocat',
        name: 'The Octocat',
        email: 'octocat@github.local'
      }
    })

    const wrapper = mountWithApp(AccountDockPanel, { pinia })
    const actions = wrapper.findAllComponents({ name: 'QBtn' }).map((button) => button.props('label'))

    expect(wrapper.text()).toContain('Account')
    expect(wrapper.text()).toContain('Connected accounts')
    expect(wrapper.text()).toContain('GitHub')
    expect(wrapper.text()).toContain('The Octocat')
    expect(actions).toContain('Logout')
    expect(actions).toContain('Disconnect')
    expect(actions).toContain('Connect')
  })
})

describe('SubmitDockPanel', () => {
  it('renders the expanded submission form and action', () => {
    const wrapper = mountWithApp(SubmitDockPanel)
    const inputs = wrapper.findAllComponents({ name: 'QInput' })
    const selects = wrapper.findAllComponents({ name: 'QSelect' })
    const checkboxes = wrapper.findAllComponents({ name: 'QCheckbox' })
    const offerOutcome = wrapper.findComponent({ name: 'QOptionGroup' })
    const action = wrapper.findComponent({ name: 'QBtn' })

    expect(wrapper.text()).toContain('Submit a new entry')
    expect(wrapper.text()).toContain('Document the full story behind a repo, assignment, or interview project so the task, stack, and outcome are easy to understand.')
    expect(wrapper.text()).toContain('Project basics')
    expect(wrapper.text()).toContain('Technical scope')
    expect(wrapper.text()).toContain('Process & outcome')
    expect(wrapper.text()).toContain('Detailed notes')
    expect(inputs.map((input) => input.props('label'))).toEqual(expect.arrayContaining([
      'Entry title',
      'Company',
      'Role / position',
      'Source URL',
      'Time limit or expected effort',
      'Submission date',
      'Task summary',
      'Deliverables and constraints',
      'Feedback received',
      'Lessons learned',
      'Extra notes'
    ]))
    expect(selects.map((select) => select.props('label'))).toEqual(expect.arrayContaining([
      'Hiring stage',
      'Languages',
      'Frameworks, tools, and libraries',
      'Task type',
      'Difficulty',
      'Company reaction'
    ]))
    expect(selects.find((select) => select.props('label') === 'Languages')?.props('multiple')).toBe(true)
    expect(selects.find((select) => select.props('label') === 'Frameworks, tools, and libraries')?.props('multiple')).toBe(true)
    expect(checkboxes.map((checkbox) => checkbox.props('label'))).toEqual([
      'I submitted work back to the company',
      'The repository can be shared publicly',
      'NDA or confidentiality limitations apply'
    ])
    expect(offerOutcome.props('type')).toBe('radio')
    expect(offerOutcome.props('options').map((option) => option.label)).toEqual([
      'Still in progress',
      'Yes, I got an offer',
      'No offer',
      'I withdrew from the process',
      'Not a hiring process'
    ])
    expect(action.props('label')).toBe('Prepare submission')
  })
})
