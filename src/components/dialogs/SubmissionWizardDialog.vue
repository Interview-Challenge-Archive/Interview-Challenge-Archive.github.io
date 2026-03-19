<template>
  <q-dialog ref="dialogRef" persistent :maximized="isMobileDialogFullScreen" @hide="handleDialogHide">
    <q-card class="submission-wizard-dialog q-pa-md">
      <div class="submission-wizard-dialog__header row items-center no-wrap q-mb-md">
        <div class="text-h6 row items-center no-wrap col submission-wizard-dialog__header-title">
          <span class="text-uppercase">{{ dialogTitle }}</span>
          <span
            v-if="dialogHeaderRepositorySuffix"
            class="q-ml-sm col ellipsis text-grey-6 text-body2 submission-wizard-dialog__header-repository"
          >
            {{ dialogHeaderRepositorySuffix }}
          </span>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          :aria-label="t('dock.submissions.dialog.actions.close')"
          @click="handleDialogCancel"
        />
      </div>

      <q-scroll-area class="submission-wizard-dialog__scroll">
        <div class="submission-wizard-dialog__layout row no-wrap">
          <aside v-if="isDesktopWizardLayout" class="submission-wizard-dialog__sidebar col-auto">
            <div class="submission-wizard-dialog__step-nav column">
              <button
                v-for="wizardStep in wizardSteps"
                :key="wizardStep.name"
                type="button"
                class="submission-wizard-dialog__step-link row items-center no-wrap"
                :class="{
                  'submission-wizard-dialog__step-link--active': step === wizardStep.name,
                  'submission-wizard-dialog__step-link--done': step > wizardStep.name
                }"
                :disabled="!canNavigateToStep(wizardStep.name)"
                @click="goToStep(wizardStep.name)"
              >
                <q-avatar
                  size="24px"
                  class="q-mr-sm"
                  :class="step > wizardStep.name ? 'bg-positive text-white' : (step === wizardStep.name ? 'bg-dark text-white' : 'bg-grey-3 text-grey-8')"
                >
                  <q-icon :name="step > wizardStep.name ? 'check' : wizardStep.icon" size="14px" />
                </q-avatar>
                <div class="column">
                  <div class="text-caption text-grey-6">Step {{ wizardStep.name }}</div>
                  <div class="text-body2">{{ wizardStep.title }}</div>
                </div>
              </button>
            </div>
          </aside>

          <div class="submission-wizard-dialog__content-col col">
            <q-stepper
              v-model="step"
              flat
              animated
              :contracted="isContractedStepper"
              :header-class="stepperHeaderClass"
              class="bg-transparent submission-wizard-dialog__stepper"
            >
        <q-step
          :name="1"
          :title="t('dock.submissions.dialog.steps.repository')"
          icon="folder"
          :done="step > 1"
        >
          <SubmissionWizardStepRepository
            ref="stepRepositoryRef"
            :is-submit-mode="isSubmitMode"
            :organization-options="organizationOptions"
            :repository-options="repositoryOptions"
            :is-loading-organizations="isLoadingOrganizations"
            :is-loading-repositories="isLoadingRepositories"
            :organization-options-available="organizationOptionsAvailable"
            :dialog-error-message="dialogErrorMessage"
            @organizations-virtual-scroll="onOrganizationsVirtualScroll"
            @repositories-virtual-scroll="onRepositoriesVirtualScroll"
            @draft-organization-change="handleRepositoryStepOrganizationDraftChange"
            @validity-change="setStepValidity(1, $event)"
          />
        </q-step>

        <q-step
          :name="2"
          :title="t('dock.submissions.dialog.steps.projectType')"
          icon="category"
          :done="step > 2"
        >
          <SubmissionWizardStepProjectType
            ref="stepProjectTypeRef"
            :is-loading-project-info="isLoadingProjectInfo"
            :is-project-type-autofilled="isProjectTypeAutofilled"
            :project-info-error-message="projectInfoErrorMessage"
            @validity-change="setStepValidity(2, $event)"
          />
        </q-step>

        <q-step
          :name="3"
          :title="t('dock.submissions.dialog.steps.company')"
          icon="business"
          :done="step > 3"
        >
          <SubmissionWizardStepCompany
            ref="stepCompanyRef"
            @validity-change="setStepValidity(3, $event)"
          />
        </q-step>

        <q-step
          :name="4"
          :title="t('dock.submissions.dialog.steps.summary')"
          icon="description"
          :done="step > 4"
        >
          <SubmissionWizardStepSummary
            ref="stepSummaryRef"
            @validity-change="setStepValidity(4, $event)"
          />
        </q-step>

        <q-step
          :name="5"
          :title="t('dock.submissions.dialog.steps.feedback')"
          icon="chat"
        >
          <SubmissionWizardStepFeedback
            ref="stepFeedbackRef"
            @validity-change="setStepValidity(5, $event)"
          />
        </q-step>
            </q-stepper>
          </div>
        </div>
      </q-scroll-area>

      <div class="submission-wizard-dialog__actions row items-center justify-between q-mt-md">
        <div class="row items-center q-gutter-sm">
          <q-btn
            flat
            no-caps
            :label="t('dock.submissions.dialog.actions.cancel')"
            @click="handleDialogCancel"
          />
        </div>

        <div class="row items-center q-gutter-sm">
          <q-btn
            v-if="step > 1"
            flat
            no-caps
            icon="chevron_left"
            :label="t('dock.submissions.dialog.actions.back')"
            @click="goToPreviousStep"
          />
          <q-btn
            v-if="step < totalSteps"
            color="dark"
            no-caps
            :label="t('dock.submissions.dialog.actions.next')"
            icon-right="chevron_right"
            :disable="!canGoNext"
            @click="goToNextStep"
          />
          <q-btn
            v-else
            color="dark"
            no-caps
            icon-right="check"
            :label="t('dock.submissions.dialog.actions.finish')"
            :disable="!canFinish"
            @click="finishWizard"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useDialogPluginComponent, useQuasar } from 'quasar'
import { useGitHubSubmissionProjectInfoStore } from 'src/stores/github-submission-project-info-store'
import { useGitHubSubmissionRepositoriesStore } from 'src/stores/github-submission-repositories-store'
import { useGitHubSubmissionsStore } from 'src/stores/github-submissions-store'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'
import positionRolesConfig from 'src/config/position_roles.yml'
import SubmissionWizardStepRepository from 'src/components/dialogs/submission-wizard-steps/SubmissionWizardStepRepository.vue'
import SubmissionWizardStepProjectType from 'src/components/dialogs/submission-wizard-steps/SubmissionWizardStepProjectType.vue'
import SubmissionWizardStepCompany from 'src/components/dialogs/submission-wizard-steps/SubmissionWizardStepCompany.vue'
import SubmissionWizardStepSummary from 'src/components/dialogs/submission-wizard-steps/SubmissionWizardStepSummary.vue'
import SubmissionWizardStepFeedback from 'src/components/dialogs/submission-wizard-steps/SubmissionWizardStepFeedback.vue'
import { normalizeTextSummaryToHtml } from 'src/utils/task-summary-importer'

const SELECT_PAGE_SIZE = 50
const SELECT_LOAD_MORE_THRESHOLD = 8
const TOTAL_STEPS = 5
const PREDEFINED_SELECT_VALUE_PREFIX = '::'

const props = defineProps({
  mode: {
    type: String,
    default: 'submit'
  },
  owner: {
    type: String,
    default: ''
  },
  repository: {
    type: String,
    default: ''
  }
})

defineEmits([
  ...useDialogPluginComponent.emits
])

const { t } = useI18n()
const $q = useQuasar()
const {
  dialogRef,
  onDialogHide: onDialogHidePlugin,
  onDialogCancel: onDialogCancelPlugin,
  onDialogOK: onDialogOKPlugin
} = useDialogPluginComponent()
const githubSubmissionProjectInfoStore = useGitHubSubmissionProjectInfoStore()
const githubSubmissionRepositoriesStore = useGitHubSubmissionRepositoriesStore()
const githubSubmissionsStore = useGitHubSubmissionsStore()
const submissionWizardStore = useSubmissionWizardStore()
const {
  isLoading: isLoadingProjectInfo,
  errorMessageKey: projectInfoErrorMessageKey
} = storeToRefs(githubSubmissionProjectInfoStore)
const {
  organizations,
  isLoadingOrganizations,
  errorMessageKey
} = storeToRefs(githubSubmissionRepositoriesStore)
const { submissions } = storeToRefs(githubSubmissionsStore)
const {
  step,
  organization,
  repository: selectedRepository,
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
  negativeFeedback
} = storeToRefs(submissionWizardStore)
const organizationOptionsLimit = ref(SELECT_PAGE_SIZE)
const repositoryOptionsLimit = ref(SELECT_PAGE_SIZE)
const stepRepositoryRef = ref(null)
const stepProjectTypeRef = ref(null)
const stepCompanyRef = ref(null)
const stepSummaryRef = ref(null)
const stepFeedbackRef = ref(null)
const repositoryLookupOrganization = ref(String(organization.value ?? '').trim())
const skipOrganizationResetOnSave = ref(false)
const stepValidityMap = ref({
  1: false,
  2: false,
  3: false,
  4: false,
  5: false
})

const isSubmitMode = computed(() => props.mode === 'submit')
const dialogTitle = computed(() => isSubmitMode.value
  ? t('dock.submissions.dialog.title.submit')
  : t('dock.submissions.dialog.title.update'))
const totalSteps = computed(() => TOTAL_STEPS)
const isDesktopWizardLayout = computed(() => $q.screen.gt.sm)
const isContractedStepper = computed(() => $q.screen.lt.sm)
const isMobileDialogFullScreen = computed(() => $q.screen.lt.sm)
const dialogHeaderRepositorySuffix = computed(() => {
  if (!isDesktopWizardLayout.value || step.value === 1) {
    return ''
  }

  const normalizedOrganization = String(organization.value ?? '').trim()
  const normalizedRepository = String(selectedRepository.value ?? '').trim()

  if (!normalizedOrganization || !normalizedRepository) {
    return ''
  }

  return `${normalizedOrganization}/${normalizedRepository}`
})
const stepperHeaderClass = computed(() => {
  if (isDesktopWizardLayout.value) {
    return 'hidden'
  }

  if (isContractedStepper.value) {
    return 'q-pa-none'
  }

  return ''
})
const wizardSteps = computed(() => [
  { name: 1, title: t('dock.submissions.dialog.steps.repository'), icon: 'folder' },
  { name: 2, title: t('dock.submissions.dialog.steps.projectType'), icon: 'category' },
  { name: 3, title: t('dock.submissions.dialog.steps.company'), icon: 'business' },
  { name: 4, title: t('dock.submissions.dialog.steps.summary'), icon: 'description' },
  { name: 5, title: t('dock.submissions.dialog.steps.feedback'), icon: 'chat' }
])
const allOrganizationOptions = computed(() =>
  [...organizations.value].sort(sortSelectOptionsByLabel))
const organizationOptions = computed(() =>
  allOrganizationOptions.value.slice(0, organizationOptionsLimit.value))
const organizationOptionsAvailable = computed(() => allOrganizationOptions.value.length > 0)
const repositoryRecords = computed(() =>
  githubSubmissionRepositoriesStore.repositoriesForOrganization(repositoryLookupOrganization.value))
const submittedRepositoryKeys = computed(() =>
  new Set(submissions.value.map((submission) => normalizeRepositoryKey(submission?.owner, submission?.repository))))
const allRepositoryOptions = computed(() =>
  repositoryRecords.value
    .map((repositoryRecord) => ({
      label: repositoryRecord.name,
      value: repositoryRecord.name,
      disable: submittedRepositoryKeys.value.has(normalizeRepositoryKey(repositoryRecord.owner, repositoryRecord.name))
    }))
    .sort(sortSelectOptionsByLabel))
const repositoryOptions = computed(() => allRepositoryOptions.value.slice(0, repositoryOptionsLimit.value))
const isLoadingRepositories = computed(() =>
  githubSubmissionRepositoriesStore.isLoadingRepositoriesForOrganization(repositoryLookupOrganization.value))
const positionTitleOptionKeys = computed(() => {
  const normalizedProjectType = String(projectType.value ?? '').trim()

  if (!normalizedProjectType) {
    return []
  }

  const configuredOptions = positionRolesConfig?.positionTitlesByProjectType?.[normalizedProjectType]

  return Array.isArray(configuredOptions)
    ? configuredOptions
    : []
})
const positionTitleOptions = computed(() =>
  positionTitleOptionKeys.value.map((optionKey) =>
    ({
      label: t(`dock.submissions.dialog.positionTitleOptions.${optionKey}`),
      value: encodePredefinedSelectValue(optionKey)
    })))
const allPositionTitleOptionKeys = computed(() => {
  const configuredOptionsByProjectType = positionRolesConfig?.positionTitlesByProjectType ?? {}
  const allOptionKeys = Object.values(configuredOptionsByProjectType)
    .filter((optionKeys) => Array.isArray(optionKeys))
    .flat()
  return [...new Set(allOptionKeys)]
})
const canGoNext = computed(() => {
  return Boolean(stepValidityMap.value[String(step.value)])
})
const canFinish = computed(() => Boolean(stepValidityMap.value['5']))
const dialogErrorMessage = computed(() => {
  if (!errorMessageKey.value) {
    return ''
  }

  return t(errorMessageKey.value)
})
const projectInfoErrorMessage = computed(() => {
  if (!projectInfoErrorMessageKey.value) {
    return ''
  }

  return t(projectInfoErrorMessageKey.value)
})

watch(organization, async (nextOrganization, previousOrganization) => {
  if (!isSubmitMode.value) {
    return
  }

  if (nextOrganization !== previousOrganization) {
    repositoryLookupOrganization.value = String(nextOrganization ?? '').trim()

    if (skipOrganizationResetOnSave.value) {
      skipOrganizationResetOnSave.value = false
      await loadRepositoriesForOrganization(nextOrganization)
      return
    }

    selectedRepository.value = ''
    repositoryOptionsLimit.value = SELECT_PAGE_SIZE
    resetDetailsForm()
    githubSubmissionProjectInfoStore.reset()
  }

  await loadRepositoriesForOrganization(nextOrganization)
})

watch(selectedRepository, (nextRepository, previousRepository) => {
  if (nextRepository === previousRepository) {
    return
  }

  resetDetailsForm()
  githubSubmissionProjectInfoStore.reset()
})

watch(projectType, (nextProjectType, previousProjectType) => {
  if (
    nextProjectType !== previousProjectType
    && isProjectTypeAutofilled.value
    && String(nextProjectType ?? '').trim() !== autofilledProjectTypeValue.value
  ) {
    isProjectTypeAutofilled.value = false
    autofilledProjectTypeValue.value = ''
  }

  alignPositionTitleWithProjectType()
})

onMounted(async () => {
  initializeWizardSession()

  if (!isSubmitMode.value) {
    return
  }

  await ensureInitialSelection()
})

async function goToNextStep () {
  if (!canGoNext.value) {
    return
  }

  saveCurrentStepDraft()

  if (step.value === 1) {
    step.value = 2
    await refetchProjectInfoAndAutofill()
    return
  }

  if (step.value < TOTAL_STEPS) {
    step.value += 1
  }
}

function goToPreviousStep () {
  if (step.value <= 1) {
    return
  }

  step.value -= 1
}

function canNavigateToStep (targetStep) {
  return Number(targetStep) <= step.value
}

function goToStep (targetStep) {
  if (!canNavigateToStep(targetStep)) {
    return
  }

  step.value = Number(targetStep)
}

function setStepValidity (stepNumber, isValid) {
  stepValidityMap.value[String(stepNumber)] = Boolean(isValid)
}

function saveCurrentStepDraft () {
  if (step.value === 1) {
    skipOrganizationResetOnSave.value = true
    stepRepositoryRef.value?.save?.()
    return
  }

  if (step.value === 2) {
    stepProjectTypeRef.value?.save?.()
    return
  }

  if (step.value === 3) {
    stepCompanyRef.value?.save?.()
    return
  }

  if (step.value === 4) {
    stepSummaryRef.value?.save?.()
  }
}

function resetStepDrafts () {
  stepRepositoryRef.value?.resetDraft?.()
  stepProjectTypeRef.value?.resetDraft?.()
  stepCompanyRef.value?.resetDraft?.()
  stepSummaryRef.value?.resetDraft?.()
  stepFeedbackRef.value?.resetDraft?.()
}

function finishWizard () {
  if (!canFinish.value) {
    return
  }

  stepFeedbackRef.value?.save?.()

  onDialogOKPlugin({
    mode: props.mode,
    owner: organization.value,
    repository: selectedRepository.value,
    details: {
      projectType: projectType.value,
      companyName: companyName.value,
      companyLinkedInUrl: companyLinkedInUrl.value,
      positionTitle: positionTitle.value,
      positionLevel: positionLevel.value,
      taskSummary: taskSummary.value,
      recruiterOutcome: recruiterOutcome.value,
      positiveFeedback: positiveFeedback.value,
      negativeFeedback: negativeFeedback.value
    }
  })
}

function handleDialogHide () {
  clearWizardSession()
  onDialogHidePlugin()
}

function handleDialogCancel () {
  clearWizardSession()
  onDialogCancelPlugin()
}

async function ensureInitialSelection () {
  try {
    await githubSubmissionRepositoriesStore.ensureOrganizationsLoaded()
    await githubSubmissionsStore.loadSubmissions()
  } catch {
    return
  }

  if (!organization.value) {
    organization.value = githubSubmissionRepositoriesStore.defaultOrganization
      || allOrganizationOptions.value[0]?.value
      || ''
  }

  repositoryLookupOrganization.value = String(organization.value ?? '').trim()
  await loadRepositoriesForOrganization(repositoryLookupOrganization.value)
}

async function loadRepositoriesForOrganization (organizationLogin) {
  const normalizedOrganizationLogin = String(organizationLogin ?? '').trim()

  if (!normalizedOrganizationLogin) {
    return
  }

  repositoryOptionsLimit.value = SELECT_PAGE_SIZE

  try {
    await githubSubmissionRepositoriesStore.ensureRepositoriesLoaded(normalizedOrganizationLogin)
  } catch {
    return
  }
}

async function handleRepositoryStepOrganizationDraftChange (organizationLogin) {
  repositoryLookupOrganization.value = String(organizationLogin ?? '').trim()
  repositoryOptionsLimit.value = SELECT_PAGE_SIZE
  await loadRepositoriesForOrganization(repositoryLookupOrganization.value)
}

async function refetchProjectInfoAndAutofill () {
  try {
    const projectInfo = await githubSubmissionProjectInfoStore.refetchProjectInfo(
      organization.value,
      selectedRepository.value
    )

    const wasProjectTypeAutofilled = autofillField(projectType, projectInfo.projectType)
    isProjectTypeAutofilled.value = wasProjectTypeAutofilled
    autofilledProjectTypeValue.value = wasProjectTypeAutofilled
      ? String(projectType.value ?? '').trim()
      : ''
    autofillField(companyName, projectInfo.companyName)
    autofillField(companyLinkedInUrl, projectInfo.companyLinkedInUrl)
    autofillField(positionTitle, normalizeAutofilledPositionTitle(projectInfo.positionTitle))
    alignPositionTitleWithProjectType()
    autofillField(taskSummary, normalizeTextSummaryToHtml(projectInfo.summary))
  } catch {
    return
  }
}

function onOrganizationsVirtualScroll ({ to }) {
  if (to + SELECT_LOAD_MORE_THRESHOLD < organizationOptionsLimit.value) {
    return
  }

  if (organizationOptionsLimit.value >= allOrganizationOptions.value.length) {
    return
  }

  organizationOptionsLimit.value += SELECT_PAGE_SIZE
}

function onRepositoriesVirtualScroll ({ to }) {
  if (to + SELECT_LOAD_MORE_THRESHOLD < repositoryOptionsLimit.value) {
    return
  }

  if (repositoryOptionsLimit.value >= allRepositoryOptions.value.length) {
    return
  }

  repositoryOptionsLimit.value += SELECT_PAGE_SIZE
}

function sortSelectOptionsByLabel (left, right) {
  return String(left?.label ?? '').localeCompare(String(right?.label ?? ''))
}

function normalizeRepositoryKey (owner, repository) {
  const normalizedOwner = String(owner ?? '').trim().toLowerCase()
  const normalizedRepository = String(repository ?? '').trim().toLowerCase()

  if (!normalizedOwner || !normalizedRepository) {
    return ''
  }

  return `${normalizedOwner}/${normalizedRepository}`
}

function resetDetailsForm () {
  projectType.value = ''
  isProjectTypeAutofilled.value = false
  autofilledProjectTypeValue.value = ''
  companyName.value = ''
  companyLinkedInUrl.value = ''
  positionTitle.value = ''
  positionLevel.value = ''
  taskSummary.value = ''
  recruiterOutcome.value = 'stopped'
  positiveFeedback.value = ''
  negativeFeedback.value = ''
  repositoryLookupOrganization.value = String(organization.value ?? '').trim()
  resetStepDrafts()
  resetStepValidity()
}

function initializeWizardSession () {
  submissionWizardStore.reset({
    owner: props.owner,
    repository: props.repository
  })
  repositoryLookupOrganization.value = String(organization.value ?? '').trim()
  skipOrganizationResetOnSave.value = false
  resetStepDrafts()
  resetStepValidity()
  organizationOptionsLimit.value = SELECT_PAGE_SIZE
  repositoryOptionsLimit.value = SELECT_PAGE_SIZE
  githubSubmissionProjectInfoStore.reset()
}

function clearWizardSession () {
  submissionWizardStore.reset()
  repositoryLookupOrganization.value = String(organization.value ?? '').trim()
  skipOrganizationResetOnSave.value = false
  resetStepDrafts()
  resetStepValidity()
  organizationOptionsLimit.value = SELECT_PAGE_SIZE
  repositoryOptionsLimit.value = SELECT_PAGE_SIZE
  githubSubmissionProjectInfoStore.reset()
}

function resetStepValidity () {
  stepValidityMap.value = {
    1: Boolean(stepRepositoryRef.value?.getCanProceed?.()),
    2: Boolean(stepProjectTypeRef.value?.getCanProceed?.()),
    3: Boolean(stepCompanyRef.value?.getCanProceed?.()),
    4: Boolean(stepSummaryRef.value?.getCanProceed?.()),
    5: Boolean(stepFeedbackRef.value?.getCanProceed?.())
  }
}

function alignPositionTitleWithProjectType () {
  const selectedPositionTitleKey = decodePredefinedSelectValue(positionTitle.value)

  if (!selectedPositionTitleKey) {
    return
  }

  if (positionTitleOptionKeys.value.includes(selectedPositionTitleKey)) {
    return
  }

  if (allPositionTitleOptionKeys.value.includes(selectedPositionTitleKey)) {
    positionTitle.value = ''
  }
}

function normalizeAutofilledPositionTitle (value) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  const predefinedValue = resolveOptionValueByLabel(positionTitleOptions.value, normalizedValue)
  return predefinedValue || normalizedValue
}

function encodePredefinedSelectValue (optionKey) {
  return `${PREDEFINED_SELECT_VALUE_PREFIX}${String(optionKey ?? '').trim()}`
}

function decodePredefinedSelectValue (value) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue.startsWith(PREDEFINED_SELECT_VALUE_PREFIX)) {
    return ''
  }

  return normalizedValue.slice(PREDEFINED_SELECT_VALUE_PREFIX.length).trim()
}

function resolveOptionValueByLabel (options, label) {
  const normalizedLabel = String(label ?? '').trim().toLowerCase()

  if (!normalizedLabel) {
    return ''
  }

  return options.find((option) =>
    String(option?.label ?? '').trim().toLowerCase() === normalizedLabel
  )?.value ?? ''
}

function autofillField (fieldReference, value) {
  const currentValue = String(fieldReference.value ?? '').trim()

  if (currentValue) {
    return false
  }

  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return false
  }

  fieldReference.value = normalizedValue
  return true
}
</script>

<style scoped lang="scss">
.submission-wizard-dialog {
  width: min(860px, 96vw);
  max-width: 96vw;
  height: min(92vh, 860px);
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  &__header {
    flex: 0 0 auto;
  }

  &__header-title {
    min-width: 0;
  }

  &__header-repository {
    min-width: 0;
  }

  &__scroll {
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
  }

  &__layout {
    height: 100%;
    min-height: 0;
  }

  &__actions {
    flex: 0 0 auto;
  }

  &__sidebar {
    width: 248px;
    border-right: 1px solid #e0e0e0;
    margin-right: 16px;
    padding-right: 16px;
  }

  &__content-col {
    height: 100%;
    min-height: 0;
  }

  &__step-nav {
    gap: 6px;
  }

  &__step-link {
    width: 100%;
    border: 0;
    background: transparent;
    text-align: left;
    padding: 6px 2px 6px 10px;
    color: inherit;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: border-color 120ms ease;

    &:hover:not(:disabled) {
      border-left-color: #bdbdbd;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__step-link--active {
    border-left-color: #212121;
    font-weight: 600;
  }

  &__step-link--done {
    border-left-color: #66bb6a;
  }

  &__stepper {
    :deep(.q-stepper__header) {
      flex-wrap: nowrap;
    }

    :deep(.q-stepper__tab) {
      min-width: 0;
      flex: 1 1 0;
      padding-left: 6px;
      padding-right: 6px;
    }

    :deep(.q-stepper__label) {
      min-width: 0;
    }

    :deep(.q-stepper__title) {
      font-size: 12px;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

@media (max-width: 599px) {
  .submission-wizard-dialog {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;

    &__layout {
      height: auto;
      min-height: 0;
    }

    &__sidebar {
      display: none;
    }

    &__stepper {
      :deep(.q-stepper__header--contracted) {
        min-height: 56px;
      }

      :deep(.q-stepper__header--contracted .q-stepper__tab) {
        padding-top: 14px;
        padding-bottom: 10px;
      }

      :deep(.q-stepper__header--contracted .q-stepper__tab:first-child .q-stepper__dot) {
        transform: translateX(16px);
      }

      :deep(.q-stepper__header--contracted .q-stepper__tab:last-child .q-stepper__dot) {
        transform: translateX(-16px);
      }

      :deep(.q-stepper__step-inner) {
        padding: 0;
      }
    }
  }
}

@media (min-width: 600px) {
  .submission-wizard-dialog {
    &__stepper {
      :deep(.q-stepper__step-inner) {
        padding-top: 0;
      }
    }
  }
}
</style>
