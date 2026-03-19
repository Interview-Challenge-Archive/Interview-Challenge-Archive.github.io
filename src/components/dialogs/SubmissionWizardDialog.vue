<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="submission-wizard-dialog q-pa-md">
      <div class="text-h6 q-mb-md">{{ dialogTitle }}</div>

      <q-stepper
        v-model="step"
        flat
        animated
        class="bg-transparent"
      >
        <q-step
          :name="1"
          :title="t('dock.submissions.dialog.steps.repository')"
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
                v-model="repository"
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
                v-model="repository"
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
              <div class="text-caption text-grey-7">
                {{ t('dock.submissions.dialog.autofill.readyHint') }}
              </div>

              <div>
                <label for="submission-dialog-project-type" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.projectType') }}</label>
                <q-select
                  v-model="projectType"
                  for="submission-dialog-project-type"
                  outlined
                  dense
                  emit-value
                  map-options
                  :options="projectTypeOptions"
                  :hint="t('dock.submissions.dialog.hints.projectType')"
                />
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
              <label for="submission-dialog-position-title" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.positionTitle') }}</label>
              <q-input
                v-model="positionTitle"
                for="submission-dialog-position-title"
                outlined
                dense
                :hint="t('dock.submissions.dialog.hints.positionTitle')"
              />
            </div>
          </div>
        </q-step>

        <q-step
          :name="4"
          :title="t('dock.submissions.dialog.steps.summary')"
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

      <div class="row items-center q-gutter-sm q-mt-md">
        <q-space />
        <q-btn
          v-if="step === 1"
          flat
          no-caps
          :label="t('dock.submissions.dialog.actions.cancel')"
          @click="onDialogCancel"
        />
        <q-btn
          v-if="step < totalSteps"
          color="dark"
          no-caps
          :label="t('dock.submissions.dialog.actions.next')"
          :disable="!canGoNext"
          @click="goToNextStep"
        />
        <q-btn
          v-if="step > 1"
          flat
          no-caps
          :label="t('dock.submissions.dialog.actions.back')"
          @click="goToPreviousStep"
        />
        <q-btn
          v-if="step === totalSteps"
          color="dark"
          no-caps
          :label="t('dock.submissions.dialog.actions.finish')"
          :disable="!canFinish"
          @click="finishWizard"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useDialogPluginComponent } from 'quasar'
import { useGitHubSubmissionProjectInfoStore } from 'src/stores/github-submission-project-info-store'
import { useGitHubSubmissionRepositoriesStore } from 'src/stores/github-submission-repositories-store'
import { useGitHubSubmissionsStore } from 'src/stores/github-submissions-store'

const SELECT_PAGE_SIZE = 50
const SELECT_LOAD_MORE_THRESHOLD = 8
const TOTAL_STEPS = 5

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
const {
  dialogRef,
  onDialogHide,
  onDialogCancel,
  onDialogOK
} = useDialogPluginComponent()
const githubSubmissionProjectInfoStore = useGitHubSubmissionProjectInfoStore()
const githubSubmissionRepositoriesStore = useGitHubSubmissionRepositoriesStore()
const githubSubmissionsStore = useGitHubSubmissionsStore()
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

const step = ref(1)
const organization = ref(String(props.owner ?? '').trim())
const repository = ref(String(props.repository ?? '').trim())
const projectType = ref('')
const companyName = ref('')
const companyLinkedInUrl = ref('')
const positionTitle = ref('')
const taskSummary = ref('')
const recruiterOutcome = ref('stopped')
const positiveFeedback = ref('')
const negativeFeedback = ref('')
const organizationOptionsLimit = ref(SELECT_PAGE_SIZE)
const repositoryOptionsLimit = ref(SELECT_PAGE_SIZE)

const isSubmitMode = computed(() => props.mode === 'submit')
const dialogTitle = computed(() => isSubmitMode.value
  ? t('dock.submissions.dialog.title.submit')
  : t('dock.submissions.dialog.title.update'))
const totalSteps = computed(() => TOTAL_STEPS)
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
  { label: t('dock.submissions.dialog.projectTypeOptions.takeHome'), value: 'take-home' },
  { label: t('dock.submissions.dialog.projectTypeOptions.liveCoding'), value: 'live-coding' },
  { label: t('dock.submissions.dialog.projectTypeOptions.systemDesign'), value: 'system-design' },
  { label: t('dock.submissions.dialog.projectTypeOptions.bugFix'), value: 'bug-fix' },
  { label: t('dock.submissions.dialog.projectTypeOptions.featureBuild'), value: 'feature-build' },
  { label: t('dock.submissions.dialog.projectTypeOptions.research'), value: 'research' }
])
const recruiterOutcomeOptions = computed(() => [
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.offer'), value: 'offer' },
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.nextRound'), value: 'next-round' },
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.stopped'), value: 'stopped' }
])
const canGoNext = computed(() => {
  if (step.value === 1) {
    return Boolean(
      organization.value
      && repository.value
      && !allRepositoryOptions.value.find((option) => option.value === repository.value)?.disable
    )
  }

  if (step.value === 2) {
    return Boolean(projectType.value) && !isLoadingProjectInfo.value
  }

  if (step.value === 3) {
    return Boolean(String(companyName.value ?? '').trim())
      && Boolean(String(positionTitle.value ?? '').trim())
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
    repository.value = ''
    repositoryOptionsLimit.value = SELECT_PAGE_SIZE
    resetDetailsForm()
    githubSubmissionProjectInfoStore.reset()
  }

  await loadRepositoriesForOrganization(nextOrganization)
})

watch(repository, (nextRepository, previousRepository) => {
  if (nextRepository === previousRepository) {
    return
  }

  resetDetailsForm()
  githubSubmissionProjectInfoStore.reset()
})

onMounted(async () => {
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

function finishWizard () {
  if (!canFinish.value) {
    return
  }

  onDialogOK({
    mode: props.mode,
    owner: organization.value,
    repository: repository.value,
    details: {
      projectType: projectType.value,
      companyName: companyName.value,
      companyLinkedInUrl: companyLinkedInUrl.value,
      positionTitle: positionTitle.value,
      taskSummary: taskSummary.value,
      recruiterOutcome: recruiterOutcome.value,
      positiveFeedback: positiveFeedback.value,
      negativeFeedback: negativeFeedback.value
    }
  })
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
      repository.value
    )

    autofillField(projectType, projectInfo.projectType)
    autofillField(companyName, projectInfo.companyName)
    autofillField(companyLinkedInUrl, projectInfo.companyLinkedInUrl)
    autofillField(positionTitle, projectInfo.positionTitle)
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
  companyName.value = ''
  companyLinkedInUrl.value = ''
  positionTitle.value = ''
  taskSummary.value = ''
  recruiterOutcome.value = 'stopped'
  positiveFeedback.value = ''
  negativeFeedback.value = ''
}

function autofillField (fieldReference, value) {
  const currentValue = String(fieldReference.value ?? '').trim()

  if (currentValue) {
    return
  }

  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return
  }

  fieldReference.value = normalizedValue
}
</script>

<style scoped lang="scss">
.submission-wizard-dialog {
  width: min(720px, 96vw);
  max-width: 96vw;
}
</style>
