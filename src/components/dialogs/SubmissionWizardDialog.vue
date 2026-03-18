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
            <q-select
              v-if="isSubmitMode"
              v-model="organization"
              outlined
              emit-value
              map-options
              :options="organizations"
              :label="t('dock.submissions.dialog.fields.organization')"
              :hint="t('dock.submissions.dialog.hints.organization')"
              :loading="isLoadingOrganizations"
            />
            <q-input
              v-else
              v-model="organization"
              outlined
              readonly
              :label="t('dock.submissions.dialog.fields.organization')"
            />

            <q-select
              v-if="isSubmitMode"
              v-model="repository"
              outlined
              emit-value
              map-options
              :options="repositoryOptions"
              :label="t('dock.submissions.dialog.fields.repository')"
              :hint="t('dock.submissions.dialog.hints.repository')"
              :disable="!organization"
              :loading="isLoadingRepositories"
            />
            <q-input
              v-else
              v-model="repository"
              outlined
              readonly
              :label="t('dock.submissions.dialog.fields.repository')"
            />

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
const {
  organizations,
  isLoadingOrganizations,
  errorMessageKey
} = storeToRefs(githubSubmissionRepositoriesStore)

const step = ref(1)
const organization = ref(String(props.owner ?? '').trim())
const repository = ref(String(props.repository ?? '').trim())

const isSubmitMode = computed(() => props.mode === 'submit')
const dialogTitle = computed(() => isSubmitMode.value
  ? t('dock.submissions.dialog.title.submit')
  : t('dock.submissions.dialog.title.update'))
const organizationOptionsAvailable = computed(() => organizations.value.length > 0)
const repositoryRecords = computed(() => githubSubmissionRepositoriesStore.repositoriesForOrganization(organization.value))
const repositoryOptions = computed(() => repositoryRecords.value.map((repositoryRecord) => ({
  label: repositoryRecord.name,
  value: repositoryRecord.name
})))
const isLoadingRepositories = computed(() =>
  githubSubmissionRepositoriesStore.isLoadingRepositoriesForOrganization(organization.value))
const canGoNext = computed(() => Boolean(organization.value && repository.value))
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
  } catch {
    return
  }

  if (!organization.value) {
    organization.value = githubSubmissionRepositoriesStore.defaultOrganization
      || organizations.value[0]?.value
      || ''
  }

  await loadRepositoriesForOrganization(organization.value)
}

async function loadRepositoriesForOrganization (organizationLogin) {
  const normalizedOrganizationLogin = String(organizationLogin ?? '').trim()

  if (!normalizedOrganizationLogin) {
    return
  }

  try {
    await githubSubmissionRepositoriesStore.ensureRepositoriesLoaded(normalizedOrganizationLogin)
  } catch {
    return
  }

  if (!repository.value) {
    repository.value = repositoryOptions.value[0]?.value ?? ''
  }
}
</script>

<style scoped lang="scss">
.submission-wizard-dialog {
  width: min(720px, 96vw);
  max-width: 96vw;
}
</style>
