import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  extractPdfTextFromArrayBuffer,
  loadJsZipFactory,
  looksLikeZipArchive,
  matchesFileExtension,
  matchesMimeType,
  plainTextToHtml
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const PAGES_MIME_TYPES = new Set([
  'application/vnd.apple.pages',
  'application/x-iwork-pages-sffpages'
])

const PAGES_EXTENSIONS = new Set([
  'pages'
])

export default class PagesTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, PAGES_MIME_TYPES)
      || matchesFileExtension(file, PAGES_EXTENSIONS)
  }

  async read (file) {
    const pagesArrayBuffer = await file.arrayBuffer()

    if (!looksLikeZipArchive(pagesArrayBuffer)) {
      throw new Error('invalid-pages')
    }

    const JSZip = await loadJsZipFactory()
    const archive = await JSZip.loadAsync(pagesArrayBuffer)

    const indexXmlFile = archive.file(/^index\.xml$/i)?.[0]
      ?? archive.file(/^Index\/index\.xml$/i)?.[0]

    if (indexXmlFile) {
      const indexXmlText = extractTextFromXml(await indexXmlFile.async('string'))

      if (indexXmlText) {
        return plainTextToHtml(indexXmlText)
      }
    }

    const previewPdfFile = archive.file(/^QuickLook\/Preview\.pdf$/i)?.[0]

    if (previewPdfFile) {
      const previewPdfArrayBuffer = await previewPdfFile.async('arraybuffer')
      const previewPdfText = await extractPdfTextFromArrayBuffer(previewPdfArrayBuffer)

      if (previewPdfText) {
        return plainTextToHtml(previewPdfText)
      }
    }

    const textFiles = archive.file(/\.txt$/i)

    if (textFiles.length) {
      const textContent = (await Promise.all(textFiles.map((item) => item.async('string'))))
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
        .join('\n\n')

      if (textContent) {
        return plainTextToHtml(textContent)
      }
    }

    throw new Error('unreadable-pages')
  }
}

function extractTextFromXml (xmlValue) {
  const normalizedXmlValue = String(xmlValue ?? '').trim()

  if (!normalizedXmlValue) {
    return ''
  }

  if (typeof DOMParser === 'undefined') {
    return normalizedXmlValue
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const parser = new DOMParser()
  const xmlDocument = parser.parseFromString(normalizedXmlValue, 'application/xml')

  if (xmlDocument.querySelector('parsererror')) {
    return ''
  }

  return String(xmlDocument.documentElement?.textContent ?? '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
