import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  extractReadableWordBinaryText,
  loadMammothFactory,
  looksLikeZipArchive,
  matchesFileExtension,
  matchesMimeType,
  plainTextToHtml,
  resolveFileExtension
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const WORD_MIME_TYPES = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-word.document.macroenabled.12'
])

const WORD_EXTENSIONS = new Set([
  'doc',
  'docx',
  'docm'
])

export default class WordTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, WORD_MIME_TYPES)
      || matchesFileExtension(file, WORD_EXTENSIONS)
  }

  async read (file) {
    const extension = resolveFileExtension(file?.name)
    const wordArrayBuffer = await file.arrayBuffer()
    const shouldParseAsOpenXml = extension === 'docx'
      || extension === 'docm'
      || looksLikeZipArchive(wordArrayBuffer)

    if (shouldParseAsOpenXml) {
      try {
        const mammoth = await loadMammothFactory()
        const result = await mammoth.convertToHtml({ arrayBuffer: wordArrayBuffer })
        const normalizedDocxHtml = String(result.value ?? '').trim()

        if (normalizedDocxHtml) {
          return normalizedDocxHtml
        }
      } catch {
        if (extension === 'docx' || extension === 'docm') {
          throw new Error('invalid-docx')
        }
      }
    }

    return plainTextToHtml(extractReadableWordBinaryText(wordArrayBuffer))
  }
}
