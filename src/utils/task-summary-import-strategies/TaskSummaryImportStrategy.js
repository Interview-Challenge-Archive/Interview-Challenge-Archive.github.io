export default class TaskSummaryImportStrategy {
  canRead () {
    return false
  }

  async read () {
    throw new Error('unsupported-format')
  }
}
