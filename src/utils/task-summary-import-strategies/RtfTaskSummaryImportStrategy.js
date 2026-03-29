import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  matchesFileExtension,
  matchesMimeType,
  plainTextToHtml
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const RTF_MIME_TYPES = new Set([
  'application/rtf',
  'text/rtf',
  'application/x-rtf'
])

const RTF_EXTENSIONS = new Set([
  'rtf'
])

export default class RtfTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, RTF_MIME_TYPES)
      || matchesFileExtension(file, RTF_EXTENSIONS)
  }

  async read (file) {
    return plainTextToHtml(parseRtfToPlainText(await file.text()))
  }
}

function parseRtfToPlainText (rtfContent) {
  const normalizedContent = String(rtfContent ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\{\\fonttbl[\s\S]*?\}/gi, '')
    .replace(/\{\\colortbl[\s\S]*?\}/gi, '')
    .replace(/\{\\stylesheet[\s\S]*?\}/gi, '')
    .replace(/\\par[d]?/g, '\n')
    .replace(/\\line/g, '\n')
    .replace(/\\tab/g, '\t')
    .replace(/\\u-?\d+\??/g, '')
    .replace(/\\'[0-9a-fA-F]{2}/g, (match) => String.fromCharCode(Number.parseInt(match.slice(2), 16)))
    .replace(/\\([{}\\])/g, '$1')
    .replace(/\\[a-z]+-?\d* ?/gi, '')
    .replace(/[{}]/g, '')
    .replace(/\n{3,}/g, '\n\n')

  return normalizedContent.trim()
}
