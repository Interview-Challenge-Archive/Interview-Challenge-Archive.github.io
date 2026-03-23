import { documentMarkdownReader } from '@interview-challenge-archive/document-markdown-reader'
import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: true
})

export const TASK_SUMMARY_IMPORT_ACCEPT = documentMarkdownReader.acceptedExtensions

export async function importTaskSummaryFile (file) {
  if (isHtmlFile(file)) {
    return sanitizeImportedHtml(await file.text())
  }

  try {
    const markdownContent = await documentMarkdownReader.readDocument(file)
    const renderedContent = marked.parse(markdownContent)
    const renderedHtml = typeof renderedContent === 'string'
      ? renderedContent
      : await renderedContent

    return sanitizeImportedHtml(renderedHtml)
  } catch (error) {
    const errorCode = String(error?.code ?? '').trim()

    if (errorCode) {
      throw new Error(errorCode)
    }

    throw error
  }
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

function escapeHtml (value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function isHtmlFile (file) {
  const normalizedMimeType = String(file?.type ?? '')
    .trim()
    .toLowerCase()
    .split(';')[0]

  if (normalizedMimeType === 'text/html' || normalizedMimeType === 'application/xhtml+xml') {
    return true
  }

  const normalizedFileName = String(file?.name ?? '').trim().toLowerCase()

  return normalizedFileName.endsWith('.html') || normalizedFileName.endsWith('.htm')
}
