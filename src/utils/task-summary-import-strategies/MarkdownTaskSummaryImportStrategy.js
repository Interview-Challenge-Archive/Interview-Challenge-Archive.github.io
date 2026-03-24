import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  loadMarkedFactory,
  matchesFileExtension,
  matchesMimeType
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const MARKDOWN_MIME_TYPES = new Set([
  'text/markdown',
  'text/x-markdown',
  'text/mdx',
  'text/x-mdx'
])

const MARKDOWN_EXTENSIONS = new Set([
  'md',
  'markdown',
  'mdx'
])

export default class MarkdownTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, MARKDOWN_MIME_TYPES)
      || matchesFileExtension(file, MARKDOWN_EXTENSIONS)
  }

  async read (file) {
    const marked = await loadMarkedFactory()
    const renderedContent = marked.parse(await file.text())

    return typeof renderedContent === 'string'
      ? renderedContent
      : await renderedContent
  }
}
