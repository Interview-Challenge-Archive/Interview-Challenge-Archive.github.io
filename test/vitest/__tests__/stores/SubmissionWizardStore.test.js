import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it } from 'vitest'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'

describe('useSubmissionWizardStore', () => {
  it('initializes and clears wizard state via reset', () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useSubmissionWizardStore(pinia)

    store.reset({
      owner: ' octo-org ',
      repository: ' repo-a '
    })

    expect(store.step).toBe(1)
    expect(store.organization).toBe('octo-org')
    expect(store.repository).toBe('repo-a')
    expect(store.recruiterOutcome).toBe('stopped')

    store.step = 4
    store.projectType = 'software-development'
    store.companyName = 'Octo Corp'
    store.positionTitle = 'Backend Engineer'
    store.positionLevel = 'Senior'
    store.taskSummary = 'Summary'
    store.recruiterOutcome = 'offer'

    store.reset()

    expect(store.step).toBe(1)
    expect(store.organization).toBe('')
    expect(store.repository).toBe('')
    expect(store.projectType).toBe('')
    expect(store.companyName).toBe('')
    expect(store.positionTitle).toBe('')
    expect(store.positionLevel).toBe('')
    expect(store.taskSummary).toBe('')
    expect(store.recruiterOutcome).toBe('stopped')
  })
})

