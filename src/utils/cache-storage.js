import { JsonResponse } from 'src/responses/JsonResponse'

export async function readJsonCacheEntry (cacheName, cacheKey, ttlMs) {
  if (!isCacheStorageSupported()) {
    return null
  }

  try {
    const cache = await globalThis.caches.open(cacheName)
    const response = await cache.match(cacheKey)

    if (!response) {
      return null
    }

    const payload = await response.json()
    const cachedAt = Number(payload?.cachedAt)

    if (!Number.isFinite(cachedAt) || Date.now() - cachedAt > ttlMs) {
      await cache.delete(cacheKey)
      return null
    }

    return payload?.data ?? null
  } catch {
    return null
  }
}

export async function writeJsonCacheEntry (cacheName, cacheKey, data) {
  if (!isCacheStorageSupported()) {
    return
  }

  try {
    const cache = await globalThis.caches.open(cacheName)
    const response = new JsonResponse({
      cachedAt: Date.now(),
      data
    })

    await cache.put(cacheKey, response)
  } catch {
    return
  }
}

function isCacheStorageSupported () {
  return typeof globalThis !== 'undefined'
    && typeof globalThis.caches !== 'undefined'
}
