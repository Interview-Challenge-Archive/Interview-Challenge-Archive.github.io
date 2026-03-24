import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  matchesFileExtension,
  matchesMimeType
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const HTML_MIME_TYPES = new Set([
  'text/html',
  'application/xhtml+xml'
])

const HTML_EXTENSIONS = new Set([
  'html',
  'htm'
])

export default class HtmlTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, HTML_MIME_TYPES)
      || matchesFileExtension(file, HTML_EXTENSIONS)
  }

  async read (file) {
    return await file.text()
  }
}
