import { describe, expect, it } from 'vitest'
import { JsonResponse } from 'src/responses/JsonResponse'

describe('JsonResponse', () => {
  it('serializes data as JSON with default status and content type', async () => {
    const response = new JsonResponse({ ok: true })

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    await expect(response.json()).resolves.toEqual({ ok: true })
  })

  it('uses provided status and custom headers', () => {
    const response = new JsonResponse(
      { ok: true },
      201,
      { 'X-Test-Header': 'value' }
    )

    expect(response.status).toBe(201)
    expect(response.headers.get('Content-Type')).toBe('application/json')
    expect(response.headers.get('X-Test-Header')).toBe('value')
  })
})
