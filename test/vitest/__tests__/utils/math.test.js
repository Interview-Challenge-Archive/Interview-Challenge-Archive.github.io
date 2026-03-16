import { describe, expect, it } from 'vitest'
import { clamp } from 'src/utils/math'

describe('math utils', () => {
  describe('clamp', () => {
    it('returns the value if it is within the range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })

    it('returns the minimum value if the input is below the range', () => {
      expect(clamp(-5, 0, 10)).toBe(0)
    })

    it('returns the maximum value if the input is above the range', () => {
      expect(clamp(15, 0, 10)).toBe(10)
    })

    it('returns the boundary value if the input is equal to the boundary', () => {
      expect(clamp(0, 0, 10)).toBe(0)
      expect(clamp(10, 0, 10)).toBe(10)
    })

    it('handles negative boundaries', () => {
      expect(clamp(-10, -20, -5)).toBe(-10)
      expect(clamp(-25, -20, -5)).toBe(-20)
      expect(clamp(0, -20, -5)).toBe(-5)
    })
  })
})
