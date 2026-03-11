import { describe, expect, it } from 'vitest'
import AboutDockPanel from 'src/components/dock-panels/AboutDockPanel.vue'
import LoginDockPanel from 'src/components/dock-panels/LoginDockPanel.vue'
import SubmitDockPanel from 'src/components/dock-panels/SubmitDockPanel.vue'
import { mountWithApp } from '../../helpers/mount-with-app'

describe('AboutDockPanel', () => {
  it('renders the translated about copy', () => {
    const wrapper = mountWithApp(AboutDockPanel)

    expect(wrapper.text()).toContain('About Interview Challenge Archive')
    expect(wrapper.text()).toContain('Interview Challenge Archive is a place to collect, organize, and review interview and hiring task material.')
    expect(wrapper.text()).toContain('Use the bottom navigation to move between dedicated search, submission, login, and information pages.')
  })
})

describe('LoginDockPanel', () => {
  it('renders translated fields and the login action', () => {
    const wrapper = mountWithApp(LoginDockPanel)
    const inputs = wrapper.findAllComponents({ name: 'QInput' })
    const action = wrapper.findComponent({ name: 'QBtn' })

    expect(wrapper.text()).toContain('Login to your account')
    expect(wrapper.text()).toContain('Access saved submissions, favorites, and your personal activity.')
    expect(inputs).toHaveLength(2)
    expect(inputs.map((input) => input.props('label'))).toEqual(['Email', 'Password'])
    expect(inputs.map((input) => input.props('type'))).toEqual(['email', 'password'])
    expect(action.props('label')).toBe('Login')
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
