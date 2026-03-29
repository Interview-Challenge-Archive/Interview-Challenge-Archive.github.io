<template>
  <div class="column q-gutter-md">
    <div>
      <label for="submission-dialog-organization" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.organization') }}</label>
      <q-select
        v-if="isSubmitMode"
        v-model="draftOrganization"
        for="submission-dialog-organization"
        outlined
        dense
        emit-value
        map-options
        :options="organizationOptions"
        :hint="t('dock.submissions.dialog.hints.organization')"
        :loading="isLoadingOrganizations"
        @virtual-scroll="(payload) => emit('organizations-virtual-scroll', payload)"
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
        v-model="draftOrganization"
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
        v-model="draftRepository"
        for="submission-dialog-repository"
        outlined
        dense
        emit-value
        map-options
        :options="repositoryOptions"
        :hint="t('dock.submissions.dialog.hints.repository')"
        :disable="!draftOrganization"
        :loading="isLoadingRepositories"
        @virtual-scroll="(payload) => emit('repositories-virtual-scroll', payload)"
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
        v-model="draftRepository"
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
    <div v-else-if="draftOrganization && !repositoryOptions.length && isSubmitMode && !isLoadingRepositories" class="text-caption text-grey-7">
      {{ t('dock.submissions.dialog.empty.repositories') }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'

const props = defineProps({
  isSubmitMode: {
    type: Boolean,
    default: false
  },
  organizationOptions: {
    type: Array,
    default: () => []
  },
  repositoryOptions: {
    type: Array,
    default: () => []
  },
  isLoadingOrganizations: {
    type: Boolean,
    default: false
  },
  isLoadingRepositories: {
    type: Boolean,
    default: false
  },
  organizationOptionsAvailable: {
    type: Boolean,
    default: false
  },
  dialogErrorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'organizations-virtual-scroll',
  'repositories-virtual-scroll',
  'draft-organization-change',
  'validity-change'
])

const { t } = useI18n()
const submissionWizardStore = useSubmissionWizardStore()
const {
  organization,
  repository
} = storeToRefs(submissionWizardStore)

const draftOrganization = ref(organization.value)
const draftRepository = ref(repository.value)
const isDirty = ref(false)
const isHydratingFromStore = ref(false)

watch(organization, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftOrganization.value = value
    isHydratingFromStore.value = false
  }
})

watch(repository, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftRepository.value = value
    isHydratingFromStore.value = false
  }
})

watch([draftOrganization, draftRepository], ([nextOrganization, nextRepository], [previousOrganization, previousRepository]) => {
  if (isHydratingFromStore.value) {
    return
  }

  if (nextOrganization !== previousOrganization || nextRepository !== previousRepository) {
    isDirty.value = true
  }
})

watch(draftOrganization, (nextOrganization, previousOrganization) => {
  if (nextOrganization === previousOrganization) {
    return
  }

  const normalizedNextOrganization = String(nextOrganization ?? '').trim()
  const normalizedStoredOrganization = String(organization.value ?? '').trim()

  if (normalizedNextOrganization !== normalizedStoredOrganization) {
    draftRepository.value = ''
  }

  emit('draft-organization-change', nextOrganization)
})

const canProceed = computed(() => {
  const normalizedOrganization = String(draftOrganization.value ?? '').trim()
  const normalizedRepository = String(draftRepository.value ?? '').trim()

  if (!normalizedOrganization || !normalizedRepository) {
    return false
  }

  const selectedRepositoryOption = props.repositoryOptions.find((option) => option.value === normalizedRepository)
  return !selectedRepositoryOption?.disable
})

watch(canProceed, (value) => {
  emit('validity-change', value)
}, { immediate: true })

function save () {
  organization.value = String(draftOrganization.value ?? '').trim()
  repository.value = String(draftRepository.value ?? '').trim()
  isDirty.value = false
}

function resetDraft () {
  draftOrganization.value = organization.value
  draftRepository.value = repository.value
  isDirty.value = false
}

function getCanProceed () {
  return canProceed.value
}

defineExpose({
  save,
  resetDraft,
  getCanProceed
})
</script>
