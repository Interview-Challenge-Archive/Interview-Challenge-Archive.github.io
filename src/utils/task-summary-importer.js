const WORD_BINARY_TEXT_DECODER = new TextDecoder('latin1')
const SUPPORTED_EXTENSIONS = new Set(['md', 'markdown', 'rtf', 'doc', 'docx', 'odt', 'fodt', 'txt'])

export const TASK_SUMMARY_IMPORT_ACCEPT = '.md,.markdown,.rtf,.doc,.docx,.odt,.fodt,.txt'

let jsZipFactoryPromise
let mammothFactoryPromise
let markedFactoryPromise

export async function importTaskSummaryFile (file) {
  const extension = resolveFileExtension(file?.name)

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error('unsupported-format')
  }

  if (extension === 'md' || extension === 'markdown') {
    return sanitizeImportedHtml(await renderMarkdownToHtml(await file.text()))
  }

  if (extension === 'rtf') {
    return plainTextToHtml(parseRtfToPlainText(await file.text()))
  }

  if (extension === 'docx') {
    const mammoth = await loadMammothFactory()
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() })
    return sanitizeImportedHtml(result.value)
  }

  if (extension === 'odt') {
    return sanitizeImportedHtml(await renderOdtArchiveToHtml(await file.arrayBuffer()))
  }

  if (extension === 'fodt') {
    return sanitizeImportedHtml(renderOpenDocumentXmlToHtml(await file.text()))
  }

  if (extension === 'doc') {
    return plainTextToHtml(extractReadableWordBinaryText(await file.arrayBuffer()))
  }

  return plainTextToHtml(await file.text())
}

export function normalizeTextSummaryToHtml (value) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  if (/<[a-z][\s\S]*>/i.test(normalizedValue)) {
    return sanitizeImportedHtml(normalizedValue)
  }

  return plainTextToHtml(normalizedValue)
}

function resolveFileExtension (fileName) {
  const normalizedFileName = String(fileName ?? '').trim()
  const lastDotIndex = normalizedFileName.lastIndexOf('.')

  if (lastDotIndex <= -1 || lastDotIndex === normalizedFileName.length - 1) {
    return ''
  }

  return normalizedFileName.slice(lastDotIndex + 1).toLowerCase()
}

async function renderMarkdownToHtml (markdownContent) {
  const marked = await loadMarkedFactory()
  const renderedContent = marked.parse(String(markdownContent ?? ''))
  return typeof renderedContent === 'string'
    ? renderedContent
    : await renderedContent
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

function extractReadableWordBinaryText (arrayBuffer) {
  const rawContent = WORD_BINARY_TEXT_DECODER.decode(new Uint8Array(arrayBuffer))
  const normalizedContent = rawContent
    .replace(/[^\x20-\x7E\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  if (!normalizedContent) {
    throw new Error('unreadable-doc')
  }

  return normalizedContent
}

function plainTextToHtml (text) {
  const normalizedText = String(text ?? '')
    .replace(/\r\n?/g, '\n')
    .trim()

  if (!normalizedText) {
    return ''
  }

  return normalizedText
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function escapeHtml (value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
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

async function loadJsZipFactory () {
  if (!jsZipFactoryPromise) {
    jsZipFactoryPromise = import('jszip').then((module) => module.default)
  }

  return jsZipFactoryPromise
}

async function loadMammothFactory () {
  if (!mammothFactoryPromise) {
    mammothFactoryPromise = import('mammoth/mammoth.browser').then((module) => module.default)
  }

  return mammothFactoryPromise
}

async function loadMarkedFactory () {
  if (!markedFactoryPromise) {
    markedFactoryPromise = import('marked').then((module) => {
      module.marked.setOptions({
        gfm: true,
        breaks: true
      })

      return module.marked
    })
  }

  return markedFactoryPromise
}
