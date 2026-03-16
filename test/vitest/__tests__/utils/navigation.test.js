import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { navigateWithTransition, goBack } from 'src/utils/navigation'

describe('navigation utils', () => {
  let router

  beforeEach(() => {
    router = {
      push: vi.fn().mockResolvedValue(),
      back: vi.fn()
    }

    vi.stubGlobal('window', {
      history: { length: 1 },
      matchMedia: vi.fn().mockReturnValue({ matches: false })
    })

    vi.stubGlobal('document', {
      startViewTransition: undefined
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('navigateWithTransition', () => {
    it('calls router.push when View Transition API is not supported', async () => {
      await navigateWithTransition(router, '/test-route')
      expect(router.push).toHaveBeenCalledWith('/test-route')
    })

    it('uses startViewTransition when supported', async () => {
      const startViewTransition = vi.fn((callback) => callback())
      vi.stubGlobal('document', { startViewTransition })

      await navigateWithTransition(router, '/test-route')

      expect(startViewTransition).toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/test-route')
    })

    it('handles function as target', async () => {
      const targetFn = vi.fn()
      await navigateWithTransition(router, targetFn)
      expect(targetFn).toHaveBeenCalled()
    })

    it('skips transition when prefersReducedMotion is true', async () => {
      const startViewTransition = vi.fn()
      vi.stubGlobal('document', { startViewTransition })
      vi.stubGlobal('window', {
        matchMedia: vi.fn().mockReturnValue({ matches: true })
      })

      await navigateWithTransition(router, '/test-route')

      expect(startViewTransition).not.toHaveBeenCalled()
      expect(router.push).toHaveBeenCalledWith('/test-route')
    })
  })

  describe('goBack', () => {
    it('calls router.back() when history.length > 1', async () => {
      vi.stubGlobal('window', {
        history: { length: 2 },
        matchMedia: vi.fn().mockReturnValue({ matches: false })
      })

      await goBack(router)

      expect(router.back).toHaveBeenCalled()
      expect(router.push).not.toHaveBeenCalled()
    })

    it('calls router.push with fallback when history.length <= 1', async () => {
      await goBack(router, { name: 'fallback' })
      expect(router.push).toHaveBeenCalledWith({ name: 'fallback' })
    })

    it('uses default fallback if none provided', async () => {
      await goBack(router)
      expect(router.push).toHaveBeenCalledWith({ name: 'home' })
    })
  })
})
