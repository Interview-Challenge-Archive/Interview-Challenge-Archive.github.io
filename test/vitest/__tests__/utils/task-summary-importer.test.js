import { describe, expect, it } from 'vitest'
import {
  importTaskSummaryFile,
  normalizeTextSummaryToHtml,
  TASK_SUMMARY_IMPORT_ACCEPT
} from 'src/utils/task-summary-importer'

describe('task summary importer utils', () => {
  it('exports accepted file extensions string for file picker', () => {
    expect(TASK_SUMMARY_IMPORT_ACCEPT).toContain('.md')
    expect(TASK_SUMMARY_IMPORT_ACCEPT).toContain('.docx')
    expect(TASK_SUMMARY_IMPORT_ACCEPT).toContain('.odt')
  })

  it('converts markdown file to html', async () => {
    const file = new File(['# Summary\n\n- first item'], 'summary.md', { type: 'text/markdown' })
    const html = await importTaskSummaryFile(file)

    expect(html).toContain('<h1')
    expect(html).toContain('<li>first item</li>')
  })

  it('converts rtf file to html paragraphs', async () => {
    const rtfContent = '{\\rtf1\\ansi\\deff0{\\fonttbl{\\f0 Arial;}}\\f0\\fs24 Line one\\par Line two}'
    const file = new File([rtfContent], 'summary.rtf', { type: 'application/rtf' })
    const html = await importTaskSummaryFile(file)

    expect(html).toContain('<p>Line one')
    expect(html).toContain('Line two')
  })

  it('converts txt file to html paragraphs', async () => {
    const file = new File(['First line\n\nSecond line'], 'summary.txt', { type: 'text/plain' })
    const html = await importTaskSummaryFile(file)

    expect(html).toContain('<p>First line</p>')
    expect(html).toContain('<p>Second line</p>')
  })

  it('rejects unsupported file format', async () => {
    const file = new File(['x'], 'summary.pdf', { type: 'application/pdf' })

    await expect(importTaskSummaryFile(file)).rejects.toThrow('unsupported-format')
  })

  it('normalizes plain text into html paragraphs', () => {
    expect(normalizeTextSummaryToHtml('Line one\n\nLine two'))
      .toBe('<p>Line one</p><p>Line two</p>')
  })

  it('sanitizes html passed for normalization', () => {
    expect(normalizeTextSummaryToHtml('<p>Safe</p><script>alert(1)</script>'))
      .toBe('<p>Safe</p>')
  })
})
