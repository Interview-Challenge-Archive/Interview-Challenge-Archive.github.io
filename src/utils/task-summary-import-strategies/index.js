import HtmlTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/HtmlTaskSummaryImportStrategy'
import MarkdownTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/MarkdownTaskSummaryImportStrategy'
import OpenDocumentTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/OpenDocumentTaskSummaryImportStrategy'
import PagesTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/PagesTaskSummaryImportStrategy'
import PlainTextTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/PlainTextTaskSummaryImportStrategy'
import PdfTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/PdfTaskSummaryImportStrategy'
import RtfTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/RtfTaskSummaryImportStrategy'
import WordTaskSummaryImportStrategy from 'src/utils/task-summary-import-strategies/WordTaskSummaryImportStrategy'

export function createTaskSummaryImportStrategies () {
  return [
    new HtmlTaskSummaryImportStrategy(),
    new MarkdownTaskSummaryImportStrategy(),
    new RtfTaskSummaryImportStrategy(),
    new OpenDocumentTaskSummaryImportStrategy(),
    new WordTaskSummaryImportStrategy(),
    new PdfTaskSummaryImportStrategy(),
    new PagesTaskSummaryImportStrategy(),
    new PlainTextTaskSummaryImportStrategy()
  ]
}
