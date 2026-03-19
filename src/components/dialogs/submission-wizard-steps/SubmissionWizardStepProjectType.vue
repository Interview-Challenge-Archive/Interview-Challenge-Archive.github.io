<template>
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
          v-model="draftProjectType"
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
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'

const props = defineProps({
  isLoadingProjectInfo: {
    type: Boolean,
    default: false
  },
  isProjectTypeAutofilled: {
    type: Boolean,
    default: false
  },
  projectInfoErrorMessage: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['validity-change'])

const { t } = useI18n()
const submissionWizardStore = useSubmissionWizardStore()
const { projectType } = storeToRefs(submissionWizardStore)
const projectTypeOptions = computed(() => [
  { label: t('dock.submissions.dialog.projectTypeOptions.softwareDevelopment'), value: 'software-development' },
  { label: t('dock.submissions.dialog.projectTypeOptions.uiUxDesign'), value: 'ui-ux-design' },
  { label: t('dock.submissions.dialog.projectTypeOptions.qaTesting'), value: 'qa-testing' },
  { label: t('dock.submissions.dialog.projectTypeOptions.devOpsInfrastructure'), value: 'devops-infrastructure' },
  { label: t('dock.submissions.dialog.projectTypeOptions.dataMl'), value: 'data-ml' },
  { label: t('dock.submissions.dialog.projectTypeOptions.security'), value: 'security' }
])
const draftProjectType = ref(projectType.value)
const isDirty = ref(false)
const isHydratingFromStore = ref(false)

watch(projectType, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftProjectType.value = value
    isHydratingFromStore.value = false
  }
})

watch(draftProjectType, (nextValue, previousValue) => {
  if (isHydratingFromStore.value) {
    return
  }

  if (nextValue !== previousValue) {
    isDirty.value = true
  }
})

const canProceed = computed(() =>
  Boolean(String(draftProjectType.value ?? '').trim()) && !props.isLoadingProjectInfo)

watch(canProceed, (value) => {
  emit('validity-change', value)
}, { immediate: true })

function save () {
  projectType.value = String(draftProjectType.value ?? '').trim()
  isDirty.value = false
}

function resetDraft () {
  draftProjectType.value = projectType.value
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
