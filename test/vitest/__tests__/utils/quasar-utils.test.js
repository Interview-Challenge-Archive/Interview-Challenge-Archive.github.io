import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getQuasarVariable, getQuasarColorRgb } from 'src/utils/quasar-utils.js'

describe('quasar-utils', () => {
  beforeEach(() => {
    vi.stubGlobal('getComputedStyle', vi.fn(() => ({
      getPropertyValue: vi.fn(() => '#1976d2')
    })))
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  describe('getQuasarVariable', () => {
    it('returns CSS variable value with --q- prefix', () => {
      const result = getQuasarVariable('primary')
      expect(result).toBe('#1976d2')
      expect(getComputedStyle).toHaveBeenCalledWith(document.documentElement)
    })

    it('returns empty string on server-side', () => {
      vi.stubGlobal('window', undefined)
      const result = getQuasarVariable('primary')
      expect(result).toBe('')
    })

    it('trims whitespace from result', () => {
      getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => '  #1976d2  ')
      })

      const result = getQuasarVariable('primary')
      expect(result).toBe('#1976d2')
    })
  })

  describe('getQuasarColorRgb', () => {
    it('converts hex CSS variable to RGB array', () => {
      const result = getQuasarColorRgb('primary')
      expect(result).toEqual([25, 118, 210])
    })

    it('returns fallback RGB for non-hex CSS variable', () => {
      getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => 'rgb(25, 118, 210)')
      })

      const result = getQuasarColorRgb('primary')
      expect(result).toEqual([25, 118, 210])
    })

    it('returns fallback RGB on server-side', () => {
      vi.stubGlobal('window', undefined)
      const result = getQuasarColorRgb('primary')
      expect(result).toEqual([25, 118, 210])
    })

    it('handles different hex formats', () => {
      const mockComputedStyle = (hexValue) => ({
        getPropertyValue: vi.fn(() => hexValue)
      })

      getComputedStyle.mockReturnValue(mockComputedStyle('#ff0000'))
      expect(getQuasarColorRgb('primary')).toEqual([255, 0, 0])

      getComputedStyle.mockReturnValue(mockComputedStyle('#00ff00'))
      expect(getQuasarColorRgb('secondary')).toEqual([0, 255, 0])

      getComputedStyle.mockReturnValue(mockComputedStyle('#0000ff'))
      expect(getQuasarColorRgb('accent')).toEqual([0, 0, 255])
    })
  })
})
