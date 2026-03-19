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
          <div class="column q-gutter-md">
            <div>
              <label for="submission-dialog-organization" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.organization') }}</label>
              <q-select
                v-if="isSubmitMode"
                v-model="organization"
                for="submission-dialog-organization"
                outlined
                dense
                emit-value
                map-options
                :options="organizationOptions"
                :hint="t('dock.submissions.dialog.hints.organization')"
                :loading="isLoadingOrganizations"
                @virtual-scroll="onOrganizationsVirtualScroll"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section side class="q-pr-sm">
                      <q-avatar v-if="scope.opt.avatarUrl" size="22px">
                        <img :src="scope.opt.avatarUrl" :alt="scope.opt.label">
                      </q-avatar>
                      <q-icon v-else name="domain" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template #selected-item="scope">
                  <div class="row items-center no-wrap">
                    <q-avatar v-if="scope.opt.avatarUrl" size="18px" class="q-mr-xs">
                      <img :src="scope.opt.avatarUrl" :alt="scope.opt.label">
                    </q-avatar>
                    <q-icon v-else name="domain" class="q-mr-xs" />
                    <span>{{ scope.opt.label }}</span>
                  </div>
                </template>
              </q-select>
              <q-input
                v-else
                v-model="organization"
                for="submission-dialog-organization"
                outlined
                dense
                readonly
              />
            </div>

            <div>
              <label for="submission-dialog-repository" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.repository') }}</label>
              <q-select
                v-if="isSubmitMode"
                v-model="selectedRepository"
                for="submission-dialog-repository"
                outlined
                dense
                emit-value
                map-options
                :options="repositoryOptions"
                :hint="t('dock.submissions.dialog.hints.repository')"
                :disable="!organization"
                :loading="isLoadingRepositories"
                @virtual-scroll="onRepositoriesVirtualScroll"
              >
                <template #option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section side class="q-pr-sm">
                      <q-icon name="folder" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template #selected-item="scope">
                  <div class="row items-center no-wrap">
                    <q-icon name="folder" class="q-mr-xs" />
                    <span>{{ scope.opt.label }}</span>
                  </div>
                </template>
              </q-select>
              <q-input
                v-else
                v-model="selectedRepository"
                for="submission-dialog-repository"
                outlined
                dense
                readonly
              />
            </div>

            <div v-if="dialogErrorMessage" class="text-negative text-caption">
              {{ dialogErrorMessage }}
            </div>

            <div v-if="!organizationOptionsAvailable && isSubmitMode" class="text-caption text-grey-7">
              {{ t('dock.submissions.dialog.empty.organizations') }}
            </div>
            <div v-else-if="organization && !repositoryOptions.length && isSubmitMode && !isLoadingRepositories" class="text-caption text-grey-7">
              {{ t('dock.submissions.dialog.empty.repositories') }}
            </div>
          </div>
        </q-step>

        <q-step
          :name="2"
          :title="t('dock.submissions.dialog.steps.projectType')"
          icon="category"
          :done="step > 2"
        >
          <div class="column q-gutter-md">
            <div v-if="isLoadingProjectInfo" class="column items-center justify-center q-gutter-sm q-py-xl">
              <q-spinner-dots color="dark" size="2em" />
              <div class="text-caption text-grey-7">
                {{ t('dock.submissions.dialog.autofill.loading') }}
              </div>
            </div>

            <template v-else>
              <div>
                <label for="submission-dialog-project-type" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.projectType') }}</label>
                <q-option-group
                  v-model="projectType"
                  type="radio"
                  color="dark"
                  :options="projectTypeOptions"
                />
                <q-banner
                  v-if="isProjectTypeAutofilled"
                  dense
                  rounded
                  inline-actions
                  class="bg-grey-2 text-grey-9 q-mt-sm"
                >
                  <template #avatar>
                    <q-icon name="info" />
                  </template>
                  {{ t('dock.submissions.dialog.autofill.projectTypeDetected') }}
                </q-banner>
              </div>
            </template>

            <div v-if="projectInfoErrorMessage" class="text-negative text-caption">
              {{ projectInfoErrorMessage }}
            </div>
          </div>
        </q-step>

        <q-step
          :name="3"
          :title="t('dock.submissions.dialog.steps.company')"
          icon="business"
          :done="step > 3"
        >
          <div class="column q-gutter-md">
            <div>
              <label for="submission-dialog-company-name" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.companyName') }}</label>
              <q-input
                v-model="companyName"
                for="submission-dialog-company-name"
                outlined
                dense
                :hint="t('dock.submissions.dialog.hints.companyName')"
              />
            </div>

            <div>
              <label for="submission-dialog-company-linkedin" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.companyLinkedInUrl') }}</label>
              <q-input
                v-model="companyLinkedInUrl"
                for="submission-dialog-company-linkedin"
                outlined
                dense
                type="url"
                :hint="t('dock.submissions.dialog.hints.companyLinkedInUrl')"
              />
            </div>

            <div>
              <label for="submission-dialog-role" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.positionTitle') }}</label>
              <q-select
                v-model="positionTitle"
                for="submission-dialog-role"
                outlined
                dense
                use-input
                fill-input
                hide-selected
                input-debounce="0"
                new-value-mode="add-unique"
                emit-value
                map-options
                :options="positionTitleOptions"
                :disable="!projectType"
                :hint="t('dock.submissions.dialog.hints.positionTitle')"
                @input-value="onRoleInputValue"
                @new-value="onRoleNewValue"
                @blur="onRoleBlur"
              />
            </div>

            <div>
              <label for="submission-dialog-level" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.positionLevel') }}</label>
              <q-select
                v-model="positionLevel"
                for="submission-dialog-level"
                outlined
                dense
                use-input
                fill-input
                hide-selected
                input-debounce="0"
                new-value-mode="add-unique"
                emit-value
                map-options
                :options="positionLevelOptions"
                :disable="!projectType"
                :hint="t('dock.submissions.dialog.hints.positionLevel')"
                @input-value="onLevelInputValue"
                @new-value="onLevelNewValue"
                @blur="onLevelBlur"
              />
            </div>
          </div>
        </q-step>

        <q-step
          :name="4"
          :title="t('dock.submissions.dialog.steps.summary')"
          icon="description"
          :done="step > 4"
        >
          <div class="column q-gutter-md">
            <div>
              <label for="submission-dialog-task-summary" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.taskSummary') }}</label>
              <q-input
                v-model="taskSummary"
                for="submission-dialog-task-summary"
                outlined
                dense
                autogrow
                type="textarea"
                :hint="t('dock.submissions.dialog.hints.taskSummary')"
              />
            </div>
          </div>
        </q-step>

        <q-step
          :name="5"
          :title="t('dock.submissions.dialog.steps.feedback')"
          icon="chat"
        >
          <div class="column q-gutter-md">
            <div>
              <label for="submission-dialog-recruiter-outcome" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.recruiterOutcome') }}</label>
              <q-select
                v-model="recruiterOutcome"
                for="submission-dialog-recruiter-outcome"
                outlined
                dense
                emit-value
                map-options
                :options="recruiterOutcomeOptions"
                :hint="t('dock.submissions.dialog.hints.recruiterOutcome')"
              />
            </div>

            <div>
              <label for="submission-dialog-positive-feedback" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.positiveFeedback') }}</label>
              <q-input
                v-model="positiveFeedback"
                for="submission-dialog-positive-feedback"
                outlined
                dense
                autogrow
                type="textarea"
                :hint="t('dock.submissions.dialog.hints.positiveFeedback')"
              />
            </div>

            <div>
              <label for="submission-dialog-negative-feedback" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.negativeFeedback') }}</label>
              <q-input
                v-model="negativeFeedback"
                for="submission-dialog-negative-feedback"
                outlined
                dense
                autogrow
                type="textarea"
                :hint="t('dock.submissions.dialog.hints.negativeFeedback')"
              />
            </div>
          </div>
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
const roleInputValue = ref('')
const levelInputValue = ref('')

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
const repositoryRecords = computed(() => githubSubmissionRepositoriesStore.repositoriesForOrganization(organization.value))
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
  githubSubmissionRepositoriesStore.isLoadingRepositoriesForOrganization(organization.value))
const projectTypeOptions = computed(() => [
  { label: t('dock.submissions.dialog.projectTypeOptions.softwareDevelopment'), value: 'software-development' },
  { label: t('dock.submissions.dialog.projectTypeOptions.uiUxDesign'), value: 'ui-ux-design' },
  { label: t('dock.submissions.dialog.projectTypeOptions.qaTesting'), value: 'qa-testing' },
  { label: t('dock.submissions.dialog.projectTypeOptions.devOpsInfrastructure'), value: 'devops-infrastructure' },
  { label: t('dock.submissions.dialog.projectTypeOptions.dataMl'), value: 'data-ml' },
  { label: t('dock.submissions.dialog.projectTypeOptions.security'), value: 'security' }
])
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
const positionLevelOptionKeys = computed(() => {
  const normalizedProjectType = String(projectType.value ?? '').trim()
  const optionsByProjectType = positionRolesConfig?.positionLevelsByProjectType ?? {}
  const projectSpecificOptions = optionsByProjectType[normalizedProjectType]

  if (Array.isArray(projectSpecificOptions) && projectSpecificOptions.length) {
    return projectSpecificOptions
  }

  return Array.isArray(optionsByProjectType.default)
    ? optionsByProjectType.default
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
const positionLevelOptions = computed(() =>
  positionLevelOptionKeys.value.map((optionKey) =>
    ({
      label: t(`dock.submissions.dialog.positionLevelOptions.${optionKey}`),
      value: encodePredefinedSelectValue(optionKey)
    })))
const recruiterOutcomeOptions = computed(() => [
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.offer'), value: 'offer' },
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.nextRound'), value: 'next-round' },
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.stopped'), value: 'stopped' }
])
const canGoNext = computed(() => {
  if (step.value === 1) {
    return Boolean(
      organization.value
      && selectedRepository.value
      && !allRepositoryOptions.value.find((option) => option.value === selectedRepository.value)?.disable
    )
  }

  if (step.value === 2) {
    return Boolean(projectType.value) && !isLoadingProjectInfo.value
  }

  if (step.value === 3) {
    return Boolean(String(companyName.value ?? '').trim())
      && Boolean(String(positionTitle.value ?? '').trim())
      && Boolean(String(positionLevel.value ?? '').trim())
  }

  if (step.value === 4) {
    return Boolean(String(taskSummary.value ?? '').trim())
  }

  return false
})
const canFinish = computed(() => Boolean(recruiterOutcome.value))
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

function finishWizard () {
  if (!canFinish.value) {
    return
  }

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

  await loadRepositoriesForOrganization(organization.value)
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
    autofillField(taskSummary, projectInfo.summary)
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
  roleInputValue.value = ''
  levelInputValue.value = ''
}

function initializeWizardSession () {
  submissionWizardStore.reset({
    owner: props.owner,
    repository: props.repository
  })
  roleInputValue.value = ''
  levelInputValue.value = ''
  organizationOptionsLimit.value = SELECT_PAGE_SIZE
  repositoryOptionsLimit.value = SELECT_PAGE_SIZE
  githubSubmissionProjectInfoStore.reset()
}

function clearWizardSession () {
  submissionWizardStore.reset()
  roleInputValue.value = ''
  levelInputValue.value = ''
  organizationOptionsLimit.value = SELECT_PAGE_SIZE
  repositoryOptionsLimit.value = SELECT_PAGE_SIZE
  githubSubmissionProjectInfoStore.reset()
}

function onRoleInputValue (value) {
  onSelectInputValue(roleInputValue, value)
}

function onLevelInputValue (value) {
  onSelectInputValue(levelInputValue, value)
}

function onRoleNewValue (value, done) {
  onCustomSelectValue(positionTitle, roleInputValue, positionTitleOptions, value, done)
}

function onLevelNewValue (value, done) {
  onCustomSelectValue(positionLevel, levelInputValue, positionLevelOptions, value, done)
}

function onRoleBlur () {
  commitSelectInputValue(positionTitle, roleInputValue, positionTitleOptions)
}

function onLevelBlur () {
  commitSelectInputValue(positionLevel, levelInputValue, positionLevelOptions)
}

function onSelectInputValue (inputReference, value) {
  inputReference.value = String(value ?? '')
}

function commitSelectInputValue (fieldReference, inputReference, optionsReference) {
  const normalizedInput = String(inputReference.value ?? '').trim()

  if (!normalizedInput) {
    return
  }

  const normalizedSelectedValue = String(fieldReference.value ?? '').trim()

  if (normalizedSelectedValue) {
    const selectedLabel = resolveOptionLabelByValue(optionsReference.value, normalizedSelectedValue)

    if (selectedLabel && selectedLabel === normalizedInput) {
      inputReference.value = ''
      return
    }

    if (!selectedLabel && normalizedSelectedValue === normalizedInput) {
      inputReference.value = ''
      return
    }
  }

  applyCustomSelectValue(fieldReference, inputReference, optionsReference, normalizedInput)
}

function onCustomSelectValue (fieldReference, inputReference, optionsReference, value, done) {
  const normalizedValue = applyCustomSelectValue(fieldReference, inputReference, optionsReference, value)

  if (!normalizedValue) {
    done(null)
    return
  }

  done(normalizedValue)
}

function applyCustomSelectValue (fieldReference, inputReference, optionsReference, value) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  const predefinedValue = resolveOptionValueByLabel(optionsReference.value, normalizedValue)
  fieldReference.value = predefinedValue || normalizedValue
  inputReference.value = ''
  return fieldReference.value
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

function resolveOptionLabelByValue (options, value) {
  const normalizedValue = String(value ?? '').trim()

  return options.find((option) => option.value === normalizedValue)?.label ?? ''
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
