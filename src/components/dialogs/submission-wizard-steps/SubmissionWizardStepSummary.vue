<template>
  <div class="column q-gutter-md">
    <div>
      <label for="submission-dialog-task-summary" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.taskSummary') }}</label>
      <div class="row items-center q-col-gutter-sm q-row-gutter-xs q-mb-sm">
        <div class="col-auto">
          <q-btn
            dense
            outline
            icon="upload_file"
            :label="t('dock.submissions.dialog.actions.importTaskSummaryFile')"
            :loading="isTaskSummaryImporting"
            @click="openImportDialog"
          />
          <input
            ref="taskSummaryImportInputRef"
            type="file"
            class="hidden"
            :accept="taskSummaryImportAccept"
            @change="onImportInputChange"
          >
        </div>
        <div v-if="taskSummaryImportedFileName" class="col text-caption text-grey-7 ellipsis">
          {{ taskSummaryImportedFileName }}
        </div>
      </div>

      <q-banner
        v-if="taskSummaryImportErrorMessage"
        dense
        rounded
        class="bg-red-1 text-negative q-mb-sm"
      >
        {{ taskSummaryImportErrorMessage }}
      </q-banner>

      <q-editor
        id="submission-dialog-task-summary"
        v-model="draftTaskSummary"
        dense
        min-height="220px"
        :toolbar="taskSummaryEditorToolbar"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        {{ t('dock.submissions.dialog.hints.taskSummary') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'
import { importTaskSummaryFile, TASK_SUMMARY_IMPORT_ACCEPT } from 'src/utils/task-summary-importer'

const emit = defineEmits(['validity-change'])

const TASK_SUMMARY_EDITOR_TOOLBAR = [
  ['bold', 'italic', 'underline', 'strike'],
  ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
  ['link'],
  ['undo', 'redo'],
  ['viewsource']
]

const { t } = useI18n()
const submissionWizardStore = useSubmissionWizardStore()
const { taskSummary } = storeToRefs(submissionWizardStore)

const taskSummaryImportInputRef = ref(null)
const isTaskSummaryImporting = ref(false)
const taskSummaryImportErrorKey = ref('')
const taskSummaryImportedFileName = ref('')
const draftTaskSummary = ref(taskSummary.value)
const isDirty = ref(false)
const isHydratingFromStore = ref(false)

const taskSummaryImportAccept = TASK_SUMMARY_IMPORT_ACCEPT
const taskSummaryEditorToolbar = TASK_SUMMARY_EDITOR_TOOLBAR
const taskSummaryImportErrorMessage = computed(() => {
  if (!taskSummaryImportErrorKey.value) {
    return ''
  }

  return t(taskSummaryImportErrorKey.value, {
    formats: taskSummaryImportAccept
  })
})

watch(taskSummary, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftTaskSummary.value = value
    isHydratingFromStore.value = false
  }
})

watch(draftTaskSummary, (nextValue, previousValue) => {
  if (isHydratingFromStore.value) {
    return
  }

  if (nextValue !== previousValue) {
    isDirty.value = true
  }
})

const canProceed = computed(() => hasRichTextContent(draftTaskSummary.value))

watch(canProceed, (value) => {
  emit('validity-change', value)
}, { immediate: true })

function save () {
  taskSummary.value = String(draftTaskSummary.value ?? '').trim()
  isDirty.value = false
}

function resetDraft () {
  draftTaskSummary.value = taskSummary.value
  isTaskSummaryImporting.value = false
  taskSummaryImportErrorKey.value = ''
  taskSummaryImportedFileName.value = ''
  isDirty.value = false
}

function openImportDialog () {
  taskSummaryImportInputRef.value?.click()
}

async function onImportInputChange (event) {
  const fileInputElement = event?.target
  const selectedFile = fileInputElement?.files?.[0]

  if (!selectedFile) {
    return
  }

  isTaskSummaryImporting.value = true
  taskSummaryImportErrorKey.value = ''

  try {
    draftTaskSummary.value = await importTaskSummaryFile(selectedFile)
    taskSummaryImportedFileName.value = selectedFile.name
    isDirty.value = true
  } catch (error) {
    taskSummaryImportErrorKey.value = String(error?.message ?? '') === 'unsupported-format'
      ? 'dock.submissions.dialog.errors.taskSummaryImportUnsupportedFormat'
      : 'dock.submissions.dialog.errors.taskSummaryImportFailed'
  } finally {
    isTaskSummaryImporting.value = false
    fileInputElement.value = ''
  }
}

function hasRichTextContent (value) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return false
  }

  const plainText = normalizedValue
    .replace(/<[^>]*>/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()

  return Boolean(plainText)
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
