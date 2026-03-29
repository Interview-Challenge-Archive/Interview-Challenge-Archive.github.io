<template>
  <div class="column q-gutter-md full-width submission-wizard-step-summary">
    <div class="full-width">
      <label for="submission-dialog-task-summary" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.taskSummary') }}</label>
      <input
        ref="taskSummaryImportInputRef"
        type="file"
        class="hidden"
        :accept="taskSummaryImportAccept"
        @change="onImportInputChange"
      >

      <q-banner
        v-if="taskSummaryImportErrorMessage"
        dense
        rounded
        class="bg-red-1 text-negative q-mb-sm"
      >
        {{ taskSummaryImportErrorMessage }}
      </q-banner>

      <div
        id="submission-dialog-task-summary"
        ref="taskSummaryEditorRef"
        class="submission-wizard-step-summary__editor full-width"
      />
      <div v-if="taskSummaryImportedFileName" class="text-caption text-grey-7 q-mt-xs ellipsis">
        {{ taskSummaryImportedFileName }}
      </div>
      <div class="text-caption text-grey-7 q-mt-xs">
        {{ t('dock.submissions.dialog.hints.taskSummary') }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import ToastUiEditor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import { documentMarkdownReader } from '@interview-challenge-archive/document-markdown-reader'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'

const emit = defineEmits(['validity-change'])

const TASK_SUMMARY_EDITOR_TOOLBAR = [
  ['heading', 'bold', 'italic'],
  ['ul', 'ol']
]

const { t } = useI18n()
const submissionWizardStore = useSubmissionWizardStore()
const { taskSummary } = storeToRefs(submissionWizardStore)

const taskSummaryEditorRef = ref(null)
const taskSummaryEditorInstance = ref(null)
const taskSummaryEditorResizeObserver = ref(null)
const taskSummaryImportInputRef = ref(null)
const taskSummaryImportToolbarButtonRef = ref(null)
const isTaskSummaryImporting = ref(false)
const taskSummaryImportErrorKey = ref('')
const taskSummaryImportedFileName = ref('')
const draftTaskSummary = ref(normalizeEditorHtml(taskSummary.value))
const isDirty = ref(false)
const isHydratingFromStore = ref(false)
const isSyncingEditorValue = ref(false)
const isTaskSummaryEditorReady = ref(false)
let taskSummaryEditorSyncToken = 0
let shouldSkipDraftSyncOnEditorLoad = false

const taskSummaryImportAccept = documentMarkdownReader.acceptedExtensions
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
    draftTaskSummary.value = normalizeEditorHtml(value)
    syncEditorFromDraft()
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

watch(isTaskSummaryImporting, (value) => {
  if (!taskSummaryImportToolbarButtonRef.value) {
    return
  }

  taskSummaryImportToolbarButtonRef.value.disabled = value
  taskSummaryImportToolbarButtonRef.value.setAttribute('aria-busy', String(value))
})

onMounted(() => {
  createTaskSummaryEditor()
})

onBeforeUnmount(() => {
  taskSummaryEditorSyncToken += 1
  cleanupTaskSummaryImportToolbarButton()
  isTaskSummaryEditorReady.value = false
  taskSummaryEditorResizeObserver.value?.disconnect?.()
  taskSummaryEditorResizeObserver.value = null
  destroyTaskSummaryEditorInstance()
})

function save () {
  taskSummary.value = normalizeEditorHtml(draftTaskSummary.value).trim()
  isDirty.value = false
}

function resetDraft () {
  isHydratingFromStore.value = true
  draftTaskSummary.value = normalizeEditorHtml(taskSummary.value)
  syncEditorFromDraft()
  isHydratingFromStore.value = false
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
  isHydratingFromStore.value = true

  try {
    const importedSummaryMarkdown = await readTaskSummaryFileAsMarkdown(selectedFile)
    const wasAppliedToEditor = applyImportedSummaryToEditor(importedSummaryMarkdown)

    if (!wasAppliedToEditor) {
      const wasRecreatedFromImport = recreateTaskSummaryEditorFromMarkdown(importedSummaryMarkdown)

      if (!wasRecreatedFromImport) {
        throw new Error('editor-sync-failed')
      }
    }

    taskSummaryImportedFileName.value = selectedFile.name
    isDirty.value = true
  } catch (error) {
    logTaskSummaryImportFailure(selectedFile, error)
    taskSummaryImportErrorKey.value = String(error?.message ?? '') === 'unsupported-format'
      ? 'dock.submissions.dialog.errors.taskSummaryImportUnsupportedFormat'
      : 'dock.submissions.dialog.errors.taskSummaryImportFailed'
  } finally {
    isHydratingFromStore.value = false
    isTaskSummaryImporting.value = false
    fileInputElement.value = ''
  }
}

function logTaskSummaryImportFailure (file, error) {
  const fileName = String(file?.name ?? '')
  const fileExtension = fileName.includes('.')
    ? fileName.split('.').pop()?.toLowerCase() ?? ''
    : ''

  console.error('[SubmissionWizardStepSummary] Failed to import task summary file.', {
    fileName,
    fileType: String(file?.type ?? ''),
    fileSizeBytes: Number(file?.size ?? 0),
    fileExtension,
    errorMessage: String(error?.message ?? ''),
    error
  })
}

function createTaskSummaryEditor (editorConfig = {}) {
  if (!taskSummaryEditorRef.value) {
    return false
  }

  const initialMarkdownValue = String(editorConfig.initialMarkdownValue ?? '')
  shouldSkipDraftSyncOnEditorLoad = Boolean(editorConfig.skipDraftSyncOnLoad)
  cleanupTaskSummaryImportToolbarButton()
  const importToolbarButton = createImportToolbarButton()
  isTaskSummaryEditorReady.value = false
  taskSummaryEditorResizeObserver.value?.disconnect?.()
  taskSummaryEditorResizeObserver.value = null
  destroyTaskSummaryEditorInstance()
  taskSummaryEditorInstance.value = new ToastUiEditor({
    el: taskSummaryEditorRef.value,
    minHeight: '220px',
    initialValue: initialMarkdownValue,
    initialEditType: 'wysiwyg',
    hideModeSwitch: true,
    toolbarItems: [
      [
        {
          name: 'importTaskSummaryFile',
          tooltip: t('dock.submissions.dialog.actions.importTaskSummaryFile'),
          el: importToolbarButton
        },
        ...taskSummaryEditorToolbar[0]
      ],
      ...taskSummaryEditorToolbar.slice(1)
    ],
    usageStatistics: false,
    autofocus: false,
    events: {
      load: onTaskSummaryEditorLoad,
      change: onTaskSummaryEditorChange
    }
  })

  return true
}

function onTaskSummaryEditorLoad () {
  isTaskSummaryEditorReady.value = true
  attachTaskSummaryEditorResizeObserver()
  syncEditorContainerWidth()

  if (shouldSkipDraftSyncOnEditorLoad) {
    shouldSkipDraftSyncOnEditorLoad = false
    isHydratingFromStore.value = true
    draftTaskSummary.value = normalizeEditorHtml(taskSummaryEditorInstance.value?.getHTML())
    isHydratingFromStore.value = false
    return
  }

  syncEditorFromDraft()
}

function cleanupTaskSummaryImportToolbarButton () {
  taskSummaryImportToolbarButtonRef.value?.removeEventListener('click', onImportToolbarButtonClick)
  taskSummaryImportToolbarButtonRef.value = null
}

function destroyTaskSummaryEditorInstance () {
  if (!taskSummaryEditorInstance.value) {
    taskSummaryEditorRef.value?.replaceChildren?.()
    return
  }

  try {
    taskSummaryEditorInstance.value.destroy()
  } catch (error) {
    console.warn('[SubmissionWizardStepSummary] Failed to destroy task summary editor instance. Forcing host cleanup.', {
      errorMessage: String(error?.message ?? ''),
      error
    })
  } finally {
    taskSummaryEditorInstance.value = null
    taskSummaryEditorRef.value?.replaceChildren?.()
  }
}

function createImportToolbarButton () {
  const importButtonLabel = t('dock.submissions.dialog.actions.importTaskSummaryFile')
  const importButtonElement = document.createElement('button')
  importButtonElement.type = 'button'
  importButtonElement.className = 'material-icons submission-wizard-step-summary__toolbar-import'
  importButtonElement.textContent = 'upload_file'
  importButtonElement.title = importButtonLabel
  importButtonElement.setAttribute('aria-label', importButtonLabel)
  importButtonElement.disabled = isTaskSummaryImporting.value
  importButtonElement.setAttribute('aria-busy', String(isTaskSummaryImporting.value))
  importButtonElement.addEventListener('click', onImportToolbarButtonClick)
  taskSummaryImportToolbarButtonRef.value = importButtonElement

  return importButtonElement
}

function onImportToolbarButtonClick (event) {
  event?.preventDefault?.()

  if (isTaskSummaryImporting.value) {
    return
  }

  openImportDialog()
}

function onTaskSummaryEditorChange () {
  if (isSyncingEditorValue.value) {
    return
  }

  const nextValue = normalizeEditorHtml(taskSummaryEditorInstance.value?.getHTML())

  if (nextValue !== draftTaskSummary.value) {
    draftTaskSummary.value = nextValue
  }
}

function applyImportedSummaryToEditor (importedSummaryMarkdown) {
  const taskSummaryEditor = taskSummaryEditorInstance.value

  if (!taskSummaryEditor || !isTaskSummaryEditorReady.value) {
    return false
  }

  const markdownValue = String(importedSummaryMarkdown ?? '')
  isSyncingEditorValue.value = true

  try {
    syncEditorContainerWidth()
    taskSummaryEditor.setMarkdown(markdownValue, false)
    isHydratingFromStore.value = true
    draftTaskSummary.value = normalizeEditorHtml(taskSummaryEditor.getHTML())
    isHydratingFromStore.value = false
    return true
  } catch (error) {
    console.error('[SubmissionWizardStepSummary] Failed to apply imported task summary content.', {
      markdownLength: markdownValue.length,
      errorMessage: String(error?.message ?? ''),
      error
    })

    return false
  } finally {
    isSyncingEditorValue.value = false
  }
}

function recreateTaskSummaryEditorFromMarkdown (markdownValue) {
  try {
    const recreated = createTaskSummaryEditor({
      initialMarkdownValue: String(markdownValue ?? ''),
      skipDraftSyncOnLoad: true
    })

    if (recreated) {
      console.warn('[SubmissionWizardStepSummary] Recreated editor with markdown content after mismatched transaction.', {
        markdownLength: String(markdownValue ?? '').length
      })
    }

    return recreated
  } catch (error) {
    console.error('[SubmissionWizardStepSummary] Failed to recreate editor after mismatched transaction.', {
      markdownLength: String(markdownValue ?? '').length,
      errorMessage: String(error?.message ?? ''),
      error
    })
    return false
  }
}

function syncEditorFromDraft () {
  const taskSummaryEditor = taskSummaryEditorInstance.value

  if (!taskSummaryEditor || !isTaskSummaryEditorReady.value) {
    return
  }

  const normalizedDraftValue = normalizeEditorHtml(draftTaskSummary.value)
  const currentEditorValue = normalizeEditorHtml(taskSummaryEditor.getHTML())

  if (normalizedDraftValue === currentEditorValue) {
    return
  }

  const syncToken = ++taskSummaryEditorSyncToken
  scheduleEditorHtmlSync(normalizedDraftValue, syncToken, 0)
}

function scheduleEditorHtmlSync (htmlValue, syncToken, retryCount) {
  Promise.resolve().then(() => {
    if (syncToken !== taskSummaryEditorSyncToken) {
      return
    }

    void applyEditorHtmlSync(htmlValue, syncToken, retryCount)
  })
}

async function applyEditorHtmlSync (htmlValue, syncToken, retryCount) {
  const taskSummaryEditor = taskSummaryEditorInstance.value

  if (!taskSummaryEditor || !isTaskSummaryEditorReady.value || syncToken !== taskSummaryEditorSyncToken) {
    return
  }

  const nextValue = normalizeEditorHtml(htmlValue)
  const currentEditorValue = normalizeEditorHtml(taskSummaryEditor.getHTML())

  if (nextValue === currentEditorValue) {
    return
  }

  isSyncingEditorValue.value = true

  try {
    syncEditorContainerWidth()
    taskSummaryEditor.setHTML(nextValue, false)
  } catch (error) {
    if (isMismatchedTransactionError(error) && retryCount < 2) {
      globalThis.setTimeout(() => {
        if (syncToken !== taskSummaryEditorSyncToken) {
          return
        }

        void applyEditorHtmlSync(normalizeEditorHtml(draftTaskSummary.value), syncToken, retryCount + 1)
      }, 0)
      return
    }

    if (isMismatchedTransactionError(error)) {
      const recovered = await recoverEditorWithMarkdownFallback(nextValue, syncToken)

      if (recovered) {
        return
      }
    }

    console.error('[SubmissionWizardStepSummary] Failed to sync task summary editor from draft.', {
      retryCount,
      draftLength: nextValue.length,
      errorMessage: String(error?.message ?? ''),
      error
    })
  } finally {
    isSyncingEditorValue.value = false
  }
}

function isMismatchedTransactionError (error) {
  return error instanceof RangeError
    && String(error?.message ?? '').toLowerCase().includes('mismatched transaction')
}

async function recoverEditorWithMarkdownFallback (htmlValue, syncToken) {
  const taskSummaryEditor = taskSummaryEditorInstance.value

  if (!taskSummaryEditor || syncToken !== taskSummaryEditorSyncToken) {
    return false
  }

  const fallbackMarkdownValue = await convertHtmlToMarkdown(htmlValue)

  try {
    taskSummaryEditor.setMarkdown(fallbackMarkdownValue, false)
    const recoveredHtmlValue = normalizeEditorHtml(taskSummaryEditor.getHTML())

    isHydratingFromStore.value = true
    draftTaskSummary.value = recoveredHtmlValue
    isHydratingFromStore.value = false

    console.warn('[SubmissionWizardStepSummary] Recovered editor sync with markdown fallback after mismatched transaction.', {
      originalHtmlLength: String(htmlValue ?? '').length,
      fallbackMarkdownLength: fallbackMarkdownValue.length
    })

    return true
  } catch (fallbackError) {
    console.error('[SubmissionWizardStepSummary] Failed to recover editor sync with markdown fallback.', {
      originalHtmlLength: String(htmlValue ?? '').length,
      fallbackMarkdownLength: fallbackMarkdownValue.length,
      fallbackErrorMessage: String(fallbackError?.message ?? ''),
      fallbackError
    })

    return false
  }
}

function attachTaskSummaryEditorResizeObserver () {
  taskSummaryEditorResizeObserver.value?.disconnect?.()
  taskSummaryEditorResizeObserver.value = null

  if (typeof ResizeObserver === 'undefined' || !taskSummaryEditorRef.value) {
    return
  }

  taskSummaryEditorResizeObserver.value = new ResizeObserver(() => {
    syncEditorContainerWidth()
  })
  taskSummaryEditorResizeObserver.value.observe(taskSummaryEditorRef.value)
}

function syncEditorContainerWidth () {
  const editorHostElement = taskSummaryEditorRef.value

  if (!editorHostElement) {
    return
  }

  const taskSummaryEditorRootElement = editorHostElement.querySelector('.toastui-editor-defaultUI')
  const availableWidth = editorHostElement.clientWidth

  if (!taskSummaryEditorRootElement || availableWidth <= 0) {
    return
  }

  taskSummaryEditorRootElement.style.width = `${availableWidth}px`
  taskSummaryEditorRootElement.style.maxWidth = '100%'
  taskSummaryEditorRootElement.style.boxSizing = 'border-box'
}

function normalizeEditorHtml (value) {
  const normalizedValue = String(value ?? '').trim()
  return normalizedValue === '<p><br></p>' ? '' : normalizedValue
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

async function readTaskSummaryFileAsMarkdown (file) {
  if (isHtmlFile(file)) {
    return await convertHtmlToMarkdown(sanitizeImportedHtml(await file.text()))
  }

  try {
    return await documentMarkdownReader.readDocument(file)
  } catch (error) {
    const errorCode = String(error?.code ?? '').trim()

    if (errorCode) {
      throw new Error(errorCode)
    }

    throw error
  }
}

async function convertHtmlToMarkdown (htmlValue) {
  const normalizedHtmlValue = String(htmlValue ?? '').trim()

  if (!normalizedHtmlValue) {
    return ''
  }

  if (typeof File === 'undefined') {
    return extractPlainTextFromHtml(normalizedHtmlValue)
  }

  try {
    return await documentMarkdownReader.readDocument(
      new File([normalizedHtmlValue], 'task-summary.html', { type: 'text/html' })
    )
  } catch {
    return extractPlainTextFromHtml(normalizedHtmlValue)
  }
}

function extractPlainTextFromHtml (value) {
  if (typeof DOMParser === 'undefined') {
    return String(value ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const parser = new DOMParser()
  const parsedDocument = parser.parseFromString(String(value ?? ''), 'text/html')

  return String(parsedDocument.body?.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sanitizeImportedHtml (value) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  return normalizedValue
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<\/?(iframe|object|embed|link)\b[^>]*>/gi, '')
    .replace(/\son[a-z-]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z-]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z-]+\s*=\s*[^\s>]+/gi, '')
    .replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '')
    .trim()
}

function isHtmlFile (file) {
  const normalizedMimeType = String(file?.type ?? '')
    .trim()
    .toLowerCase()
    .split(';')[0]

  if (normalizedMimeType === 'text/html' || normalizedMimeType === 'application/xhtml+xml') {
    return true
  }

  const normalizedFileName = String(file?.name ?? '').trim().toLowerCase()

  return normalizedFileName.endsWith('.html') || normalizedFileName.endsWith('.htm')
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

<style scoped lang="scss">
.submission-wizard-step-summary {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;

  &__editor {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow: hidden;
  }

  :deep(.toastui-editor-defaultUI) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  :deep(.toastui-editor-main) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  :deep(.toastui-editor-main-container) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  :deep(.toastui-editor-ww-editor) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
  }

  :deep(.toastui-editor-ww-container) {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }

  :deep(.toastui-editor-defaultUI-toolbar) {
    width: 100%;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    padding-left: 8px;
    padding-right: 8px;
  }

  :deep(.toastui-editor-toolbar-group) {
    flex-shrink: 0;
  }

  :deep(.toastui-editor-defaultUI-toolbar button) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    min-width: 32px;
    height: 32px;
    border-radius: 4px;
    padding: 0;
  }

  :deep(.submission-wizard-step-summary__toolbar-import) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    color: #616161;
    cursor: pointer;
    height: 32px;
    width: 32px;
    min-width: 32px;
    font-size: 18px;
    line-height: 1;
    border-radius: 4px;
    padding: 0;

    &:hover {
      background: #f5f5f5;
      color: #212121;
    }

    &:disabled {
      opacity: 0.5;
      cursor: wait;
      background: transparent;
      color: #9e9e9e;
    }
  }
}
</style>
