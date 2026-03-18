import { afterEach, describe, expect, it, vi } from 'vitest'
import { readJsonCacheEntry, writeJsonCacheEntry } from 'src/utils/cache-storage'

describe('cache-storage utils', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns null when Cache Storage API is not available', async () => {
    vi.stubGlobal('caches', undefined)

    await expect(readJsonCacheEntry('cache-name', '/cache-key', 1000)).resolves.toBeNull()
  })

  it('deletes expired entries and returns null', async () => {
    const cache = {
      match: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({
          cachedAt: Date.now() - 2000,
          data: { value: 1 }
        }))
      ),
      delete: vi.fn().mockResolvedValue(true)
    }

    vi.stubGlobal('caches', {
      open: vi.fn().mockResolvedValue(cache)
    })

    await expect(readJsonCacheEntry('cache-name', '/cache-key', 1000)).resolves.toBeNull()
    expect(cache.delete).toHaveBeenCalledWith('/cache-key')
  })

  it('returns cached data when entry is fresh', async () => {
    const cache = {
      match: vi.fn().mockResolvedValue(
        new Response(JSON.stringify({
          cachedAt: Date.now(),
          data: { value: 1 }
        }))
      )
    }

    vi.stubGlobal('caches', {
      open: vi.fn().mockResolvedValue(cache)
    })

    await expect(readJsonCacheEntry('cache-name', '/cache-key', 1000)).resolves.toEqual({ value: 1 })
  })

  it('writes JSON payload to cache with cachedAt metadata', async () => {
    let capturedResponse = null
    const cache = {
      put: vi.fn((cacheKey, response) => {
        capturedResponse = { cacheKey, response }
      })
    }

    vi.stubGlobal('caches', {
      open: vi.fn().mockResolvedValue(cache)
    })

    await writeJsonCacheEntry('cache-name', '/cache-key', { value: 42 })

    expect(cache.put).toHaveBeenCalledTimes(1)
    expect(capturedResponse.cacheKey).toBe('/cache-key')
    expect(capturedResponse.response.headers.get('Content-Type')).toBe('application/json')
    await expect(capturedResponse.response.json()).resolves.toMatchObject({
      cachedAt: expect.any(Number),
      data: { value: 42 }
    })
  })
})
