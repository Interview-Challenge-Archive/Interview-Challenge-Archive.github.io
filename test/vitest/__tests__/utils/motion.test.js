import { describe, expect, it, vi, afterEach } from 'vitest'
import { prefersReducedMotion } from 'src/utils/motion'

describe('motion utils', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('window', undefined)
  })

  describe('prefersReducedMotion', () => {
    it('returns true when media query matches', () => {
      vi.stubGlobal('window', {
        matchMedia: vi.fn().mockReturnValue({
          matches: true
        })
      })

      expect(prefersReducedMotion()).toBe(true)
      expect(window.matchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })

    it('returns false when media query does not match', () => {
      vi.stubGlobal('window', {
        matchMedia: vi.fn().mockReturnValue({
          matches: false
        })
      })

      expect(prefersReducedMotion()).toBe(false)
    })

    it('returns false when window is undefined (SSR)', () => {
      vi.stubGlobal('window', undefined)
      expect(prefersReducedMotion()).toBe(false)
    })
  })
})
