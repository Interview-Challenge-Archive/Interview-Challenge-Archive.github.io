const WORD_BINARY_TEXT_DECODER = new TextDecoder('latin1')

let jsZipFactoryPromise
let mammothFactoryPromise
let markedFactoryPromise
let pdfJsFactoryPromise

export function resolveFileExtension (fileName) {
  const normalizedFileName = String(fileName ?? '').trim()
  const lastDotIndex = normalizedFileName.lastIndexOf('.')

  if (lastDotIndex <= -1 || lastDotIndex === normalizedFileName.length - 1) {
    return ''
  }

  return normalizedFileName.slice(lastDotIndex + 1).toLowerCase()
}

export function matchesMimeType (file, supportedMimeTypes) {
  const normalizedMimeType = String(file?.type ?? '')
    .trim()
    .toLowerCase()
    .split(';')[0]

  if (!normalizedMimeType) {
    return false
  }

  return supportedMimeTypes.has(normalizedMimeType)
}

export function matchesFileExtension (file, supportedExtensions) {
  return supportedExtensions.has(resolveFileExtension(file?.name))
}

export function plainTextToHtml (text) {
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

export function sanitizeImportedHtml (value) {
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

export function escapeHtml (value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function looksLikeZipArchive (arrayBuffer) {
  const byteView = new Uint8Array(arrayBuffer)

  if (byteView.length < 4) {
    return false
  }

  return byteView[0] === 0x50
    && byteView[1] === 0x4b
    && [0x03, 0x05, 0x07].includes(byteView[2])
    && [0x04, 0x06, 0x08].includes(byteView[3])
}

export function extractReadableWordBinaryText (arrayBuffer) {
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

export async function loadJsZipFactory () {
  if (!jsZipFactoryPromise) {
    jsZipFactoryPromise = import('jszip').then((module) => module.default)
  }

  return jsZipFactoryPromise
}

export async function loadMammothFactory () {
  if (!mammothFactoryPromise) {
    mammothFactoryPromise = import('mammoth/mammoth.browser').then((module) => module.default)
  }

  return mammothFactoryPromise
}

export async function loadMarkedFactory () {
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

export async function loadPdfJsFactory () {
  if (!pdfJsFactoryPromise) {
    pdfJsFactoryPromise = import('pdfjs-dist/legacy/build/pdf.mjs')
  }

  return pdfJsFactoryPromise
}

export async function extractPdfTextFromArrayBuffer (arrayBuffer) {
  let pdfDocument

  try {
    const pdfJsModule = await loadPdfJsFactory()
    const loadingTask = pdfJsModule.getDocument({
      data: arrayBuffer,
      disableWorker: true,
      isEvalSupported: false,
      useSystemFonts: true
    })

    pdfDocument = await loadingTask.promise
    const pageTexts = []

    for (let pageNumber = 1; pageNumber <= pdfDocument.numPages; pageNumber += 1) {
      const page = await pdfDocument.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .map((item) => String(item?.str ?? ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()

      if (pageText) {
        pageTexts.push(pageText)
      }
    }

    const extractedText = pageTexts.join('\n\n').trim()

    if (!extractedText) {
      throw new Error('unreadable-pdf')
    }

    return extractedText
  } catch (error) {
    if (String(error?.message ?? '') === 'unreadable-pdf') {
      throw error
    }

    throw new Error('invalid-pdf')
  } finally {
    await pdfDocument?.destroy?.()
  }
}
