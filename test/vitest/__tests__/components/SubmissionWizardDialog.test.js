import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SubmissionWizardDialog from 'src/components/dialogs/SubmissionWizardDialog.vue'
import { useGitHubSubmissionProjectInfoStore } from 'src/stores/github-submission-project-info-store'
import { useGitHubSubmissionRepositoriesStore } from 'src/stores/github-submission-repositories-store'
import { useGitHubSubmissionsStore } from 'src/stores/github-submissions-store'
import { mountWithApp } from '../../helpers/mount-with-app'

function setupStores (pinia, {
  organizations = [{ label: 'octo-org', value: 'octo-org', avatarUrl: 'https://example.test/octo-org.png' }],
  repositories = [{ id: 1, owner: 'octo-org', name: 'repo-a', updatedAt: '2026-03-01T00:00:00Z' }],
  submissions = [],
  projectInfo = {
    owner: 'octo-org',
    repository: 'repo-a',
    repositoryUrl: 'https://github.com/octo-org/repo-a',
    summary: 'Project summary',
    topics: ['take-home'],
    languages: ['JavaScript'],
    projectType: 'take-home',
    companyName: 'Octo Corp',
    companyLinkedInUrl: 'https://www.linkedin.com/company/octo-corp/',
    positionTitle: 'Frontend Engineer'
  }
} = {}) {
  const projectInfoStore = useGitHubSubmissionProjectInfoStore(pinia)
  const repositoriesStore = useGitHubSubmissionRepositoriesStore(pinia)
  const submissionsStore = useGitHubSubmissionsStore(pinia)

  projectInfoStore.projectInfo = projectInfo
  projectInfoStore.isLoading = false
  projectInfoStore.errorMessageKey = ''
  projectInfoStore.refetchProjectInfo = vi.fn().mockResolvedValue(projectInfo)

  repositoriesStore.organizations = organizations
  repositoriesStore.repositoriesByOrganization = {
    'octo-org': repositories
  }
  repositoriesStore.errorMessageKey = ''
  repositoriesStore.ensureOrganizationsLoaded = vi.fn().mockResolvedValue(organizations)
  repositoriesStore.ensureRepositoriesLoaded = vi.fn().mockResolvedValue(repositories)

  submissionsStore.submissions = submissions
  submissionsStore.loadSubmissions = vi.fn().mockResolvedValue(submissions)

  return {
    projectInfoStore,
    repositoriesStore,
    submissionsStore
  }
}

function mountWizardDialog (pinia, props) {
  return mountWithApp(SubmissionWizardDialog, {
    pinia,
    props,
    global: {
      stubs: {
        QDialog: {
          template: '<div><slot /></div>'
        }
      }
    }
  })
}

function findNextButton (wrapper) {
  return wrapper
    .findAllComponents({ name: 'QBtn' })
    .find((button) => button.props('label') === 'Next')
}

describe('SubmissionWizardDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('requires explicit repository selection in submit mode', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    const { repositoriesStore } = setupStores(pinia)

    const wrapper = mountWizardDialog(pinia, {
      mode: 'submit',
      owner: 'octo-org',
      repository: ''
    })

    await flushPromises()

    const selects = wrapper.findAllComponents({ name: 'QSelect' })
    const repositorySelect = selects[1]
    const nextButton = findNextButton(wrapper)

    expect(repositoriesStore.ensureRepositoriesLoaded).toHaveBeenCalledWith('octo-org')
    expect(repositorySelect.props('modelValue')).toBe('')
    expect(nextButton).toBeDefined()
    expect(nextButton.props('disable')).toBe(true)

    repositorySelect.vm.$emit('update:modelValue', 'repo-a')
    await flushPromises()

    expect(findNextButton(wrapper).props('disable')).toBe(false)
  })

  it('refetches project info when moving from repository step to project type step and shows loading state', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    const { projectInfoStore } = setupStores(pinia)

    const wrapper = mountWizardDialog(pinia, {
      mode: 'submit',
      owner: 'octo-org'
    })

    await flushPromises()

    const repositorySelect = wrapper.findAllComponents({ name: 'QSelect' })[1]

    repositorySelect.vm.$emit('update:modelValue', 'repo-a')
    await flushPromises()

    projectInfoStore.isLoading = true

    await findNextButton(wrapper).trigger('click')
    await flushPromises()

    expect(projectInfoStore.refetchProjectInfo).toHaveBeenCalledWith('octo-org', 'repo-a')
    expect(wrapper.text()).toContain('Loading project details from GitHub...')
  })

  it('keeps next action disabled when selected repository is already submitted', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    setupStores(pinia, {
      submissions: [{ owner: 'octo-org', repository: 'repo-a' }]
    })

    const wrapper = mountWizardDialog(pinia, {
      mode: 'submit',
      owner: 'octo-org'
    })

    await flushPromises()

    const repositorySelect = wrapper.findAllComponents({ name: 'QSelect' })[1]
    const repositoryOption = repositorySelect.props('options').find((option) => option.value === 'repo-a')

    expect(repositoryOption?.disable).toBe(true)

    repositorySelect.vm.$emit('update:modelValue', 'repo-a')
    await flushPromises()

    expect(findNextButton(wrapper).props('disable')).toBe(true)
  })

  it('shows read-only organization and repository fields in update mode', async () => {
    const pinia = createPinia()

    setActivePinia(pinia)
    setupStores(pinia)

    const wrapper = mountWizardDialog(pinia, {
      mode: 'update',
      owner: 'octo-org',
      repository: 'repo-a'
    })

    await flushPromises()

    const inputs = wrapper.findAllComponents({ name: 'QInput' })
    const readonlyInputs = inputs.filter((input) => input.props('readonly'))

    expect(readonlyInputs).toHaveLength(2)
    expect(readonlyInputs[0].props('modelValue')).toBe('octo-org')
    expect(readonlyInputs[1].props('modelValue')).toBe('repo-a')
  })
})
