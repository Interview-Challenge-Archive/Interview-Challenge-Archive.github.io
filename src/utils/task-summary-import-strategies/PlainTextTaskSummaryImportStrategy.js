import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  matchesFileExtension,
  matchesMimeType,
  plainTextToHtml
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const TEXT_MIME_TYPES = new Set([
  'text/plain'
])

const TEXT_EXTENSIONS = new Set([
  'txt'
])

export default class PlainTextTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, TEXT_MIME_TYPES)
      || matchesFileExtension(file, TEXT_EXTENSIONS)
  }

  async read (file) {
    return plainTextToHtml(await file.text())
  }
}
