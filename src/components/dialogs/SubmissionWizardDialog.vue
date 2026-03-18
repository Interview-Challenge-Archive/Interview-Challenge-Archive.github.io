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
              />
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
              />
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
          :title="t('dock.submissions.dialog.steps.details')"
        >
          <div class="text-body2 text-grey-7">
            {{ t('dock.submissions.dialog.nextStepPlaceholder') }}
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
          v-if="step === 1"
          color="dark"
          no-caps
          :label="t('dock.submissions.dialog.actions.next')"
          :disable="!canGoNext"
          @click="goToNextStep"
        />
        <q-btn
          v-if="step === 2"
          flat
          no-caps
          :label="t('dock.submissions.dialog.actions.back')"
          @click="step = 1"
        />
        <q-btn
          v-if="step === 2"
          color="dark"
          no-caps
          :label="t('dock.submissions.dialog.actions.close')"
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
import { useGitHubSubmissionRepositoriesStore } from 'src/stores/github-submission-repositories-store'
import { useGitHubSubmissionsStore } from 'src/stores/github-submissions-store'

const SELECT_PAGE_SIZE = 50
const SELECT_LOAD_MORE_THRESHOLD = 8

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
const githubSubmissionRepositoriesStore = useGitHubSubmissionRepositoriesStore()
const githubSubmissionsStore = useGitHubSubmissionsStore()
const {
  organizations,
  isLoadingOrganizations,
  errorMessageKey
} = storeToRefs(githubSubmissionRepositoriesStore)
const { submissions } = storeToRefs(githubSubmissionsStore)

const step = ref(1)
const organization = ref(String(props.owner ?? '').trim())
const repository = ref(String(props.repository ?? '').trim())
const organizationOptionsLimit = ref(SELECT_PAGE_SIZE)
const repositoryOptionsLimit = ref(SELECT_PAGE_SIZE)

const isSubmitMode = computed(() => props.mode === 'submit')
const dialogTitle = computed(() => isSubmitMode.value
  ? t('dock.submissions.dialog.title.submit')
  : t('dock.submissions.dialog.title.update'))
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
const canGoNext = computed(() => Boolean(
  organization.value
  && repository.value
  && !allRepositoryOptions.value.find((option) => option.value === repository.value)?.disable
))
const dialogErrorMessage = computed(() => {
  if (!errorMessageKey.value) {
    return ''
  }

  return t(errorMessageKey.value)
})

watch(organization, async (nextOrganization, previousOrganization) => {
  if (!isSubmitMode.value) {
    return
  }

  if (nextOrganization !== previousOrganization) {
    repository.value = ''
    repositoryOptionsLimit.value = SELECT_PAGE_SIZE
  }

  await loadRepositoriesForOrganization(nextOrganization)
})

onMounted(async () => {
  if (!isSubmitMode.value) {
    return
  }

  await ensureInitialSelection()
})

function goToNextStep () {
  if (!canGoNext.value) {
    return
  }

  step.value = 2
}

function finishWizard () {
  onDialogOK({
    mode: props.mode,
    owner: organization.value,
    repository: repository.value
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

  if (!repository.value) {
    repository.value = allRepositoryOptions.value.find((option) => !option.disable)?.value ?? ''
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
</script>

<style scoped lang="scss">
.submission-wizard-dialog {
  width: min(720px, 96vw);
  max-width: 96vw;
}
</style>
