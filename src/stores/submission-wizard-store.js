import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

const DEFAULT_RECRUITER_OUTCOME = 'stopped'

export const useSubmissionWizardStore = defineStore('submission-wizard', () => {
  const step = ref(1)
  const organization = ref('')
  const repository = ref('')
  const projectType = ref('')
  const isProjectTypeAutofilled = ref(false)
  const autofilledProjectTypeValue = ref('')
  const companyName = ref('')
  const companyLinkedInUrl = ref('')
  const positionTitle = ref('')
  const positionLevel = ref('')
  const taskSummary = ref('')
  const recruiterOutcome = ref(DEFAULT_RECRUITER_OUTCOME)
  const positiveFeedback = ref('')
  const negativeFeedback = ref('')

  function reset (options = {}) {
    const normalizedOwner = String(options.owner ?? '').trim()
    const normalizedRepository = String(options.repository ?? '').trim()

    step.value = 1
    organization.value = normalizedOwner
    repository.value = normalizedRepository
    projectType.value = ''
    isProjectTypeAutofilled.value = false
    autofilledProjectTypeValue.value = ''
    companyName.value = ''
    companyLinkedInUrl.value = ''
    positionTitle.value = ''
    positionLevel.value = ''
    taskSummary.value = ''
    recruiterOutcome.value = DEFAULT_RECRUITER_OUTCOME
    positiveFeedback.value = ''
    negativeFeedback.value = ''
  }

  return {
    step,
    organization,
    repository,
    projectType,
    isProjectTypeAutofilled,
    autofilledProjectTypeValue,
    companyName,
    companyLinkedInUrl,
    positionTitle,
    positionLevel,
    taskSummary,
    recruiterOutcome,
    positiveFeedback,
    negativeFeedback,
    reset
  }
}, {
  persist: false
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSubmissionWizardStore, import.meta.hot))
}

