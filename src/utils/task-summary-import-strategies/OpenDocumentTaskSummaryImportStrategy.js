import TaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/TaskSummaryImportStrategy'
import {
  escapeHtml,
  loadJsZipFactory,
  matchesFileExtension,
  matchesMimeType,
  plainTextToHtml,
  resolveFileExtension
} from 'src/utils/task-summary-import-strategies/task-summary-import-helpers'

const OPENDOCUMENT_MIME_TYPES = new Set([
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.text-flat-xml'
])

const OPENDOCUMENT_EXTENSIONS = new Set([
  'odt',
  'fodt'
])

export default class OpenDocumentTaskSummaryImportStrategy extends TaskSummaryImportStrategy {
  canRead (file) {
    return matchesMimeType(file, OPENDOCUMENT_MIME_TYPES)
      || matchesFileExtension(file, OPENDOCUMENT_EXTENSIONS)
  }

  async read (file) {
    const extension = resolveFileExtension(file?.name)

    if (extension === 'fodt') {
      return renderOpenDocumentXmlToHtml(await file.text())
    }

    return renderOdtArchiveToHtml(await file.arrayBuffer())
  }
}

async function renderOdtArchiveToHtml (arrayBuffer) {
  const JSZip = await loadJsZipFactory()
  const archive = await JSZip.loadAsync(arrayBuffer)
  const contentXmlFile = archive.file('content.xml')

  if (!contentXmlFile) {
    throw new Error('invalid-odt')
  }

  return renderOpenDocumentXmlToHtml(await contentXmlFile.async('string'))
}

function renderOpenDocumentXmlToHtml (xmlContent) {
  const parser = new DOMParser()
  const xmlDocument = parser.parseFromString(String(xmlContent ?? ''), 'application/xml')

  if (xmlDocument.querySelector('parsererror')) {
    throw new Error('invalid-odt')
  }

  const textRoot = xmlDocument.getElementsByTagName('office:text')[0] ?? xmlDocument.documentElement
  const htmlBlocks = []

  for (const childNode of Array.from(textRoot.children)) {
    if (childNode.localName === 'h') {
      htmlBlocks.push(`<h3>${escapeHtml(extractNodeText(childNode))}</h3>`)
      continue
    }

    if (childNode.localName === 'p') {
      htmlBlocks.push(`<p>${escapeHtml(extractNodeText(childNode))}</p>`)
      continue
    }

    if (childNode.localName === 'list') {
      const listItems = Array.from(childNode.children)
        .filter((item) => item.localName === 'list-item')
        .map((item) => `<li>${escapeHtml(extractNodeText(item))}</li>`)
        .join('')

      if (listItems) {
        htmlBlocks.push(`<ul>${listItems}</ul>`)
      }
    }
  }

  if (!htmlBlocks.length) {
    return plainTextToHtml(String(textRoot.textContent ?? ''))
  }

  return htmlBlocks.join('')
}

function extractNodeText (node) {
  if (!node) {
    return ''
  }

  let extractedText = ''

  for (const childNode of Array.from(node.childNodes)) {
    if (childNode.nodeType === Node.TEXT_NODE) {
      extractedText += childNode.textContent ?? ''
      continue
    }

    if (childNode.nodeType !== Node.ELEMENT_NODE) {
      continue
    }

    if (childNode.localName === 'line-break') {
      extractedText += '\n'
      continue
    }

    if (childNode.localName === 'tab') {
      extractedText += '\t'
      continue
    }

    extractedText += extractNodeText(childNode)
  }

  return extractedText.replace(/\s+/g, ' ').trim()
}
