import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  extractPdfTextFromArrayBuffer,
  matchesFileExtension,
  matchesMimeType,
  plainTextToHtml
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const PDF_MIME_TYPES = new Set([
  'application/pdf'
])

const PDF_EXTENSIONS = new Set([
  'pdf'
])

export default class PdfTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, PDF_MIME_TYPES)
      || matchesFileExtension(file, PDF_EXTENSIONS)
  }

  async read (file) {
    return plainTextToHtml(await extractPdfTextFromArrayBuffer(await file.arrayBuffer()))
  }
}
