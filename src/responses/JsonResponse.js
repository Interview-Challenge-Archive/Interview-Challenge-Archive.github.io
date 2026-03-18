export class JsonResponse extends Response {
  constructor(data, status = 200, headers = {}) {
    const normalizedHeaders = new Headers(headers ?? {})

    if (!normalizedHeaders.has('Content-Type')) {
      normalizedHeaders.set('Content-Type', 'application/json')
    }

    super(JSON.stringify(data), {
      status,
      headers: normalizedHeaders
    })
  }
}
