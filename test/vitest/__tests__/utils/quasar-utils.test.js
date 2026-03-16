import { describe, it, expect, vi } from 'vitest'
import { getQuasarVariable, getQuasarColorRgb } from '../../../src/utils/quasar-utils.js'

describe('quasar-utils', () => {
  describe('getQuasarVariable', () => {
    beforeEach(() => {
      global.window = {
        getComputedStyle: vi.fn(() => ({
          getPropertyValue: vi.fn(() => '#1976d2')
        }))
      }
      global.document = {
        documentElement: {}
      }
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('returns CSS variable value with --q- prefix', () => {
      const result = getQuasarVariable('primary')
      expect(result).toBe('#1976d2')
    })

    it('returns empty string on server-side', () => {
      delete global.window
      const result = getQuasarVariable('primary')
      expect(result).toBe('')
    })

    it('trims whitespace from result', () => {
      global.window.getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => '  #1976d2  ')
      })
      
      const result = getQuasarVariable('primary')
      expect(result).toBe('#1976d2')
    })
  })

  describe('getQuasarColorRgb', () => {
    beforeEach(() => {
      global.window = {
        getComputedStyle: vi.fn(() => ({
          getPropertyValue: vi.fn(() => '#1976d2')
        }))
      }
      global.document = {
        documentElement: {}
      }
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('converts hex CSS variable to RGB array', () => {
      const result = getQuasarColorRgb('primary')
      expect(result).toEqual([25, 118, 210])
    })

    it('returns fallback RGB for non-hex CSS variable', () => {
      global.window.getComputedStyle.mockReturnValue({
        getPropertyValue: vi.fn(() => 'rgb(25, 118, 210)')
      })
      
      const result = getQuasarColorRgb('primary')
      expect(result).toEqual([25, 118, 210])
    })

    it('returns fallback RGB on server-side', () => {
      delete global.window
      const result = getQuasarColorRgb('primary')
      expect(result).toEqual([25, 118, 210])
    })

    it('handles different hex formats', () => {
      const mockComputedStyle = (hexValue) => ({
        getPropertyValue: vi.fn(() => hexValue)
      })

      global.window.getComputedStyle.mockReturnValue(mockComputedStyle('#ff0000'))
      expect(getQuasarColorRgb('primary')).toEqual([255, 0, 0])

      global.window.getComputedStyle.mockReturnValue(mockComputedStyle('#00ff00'))
      expect(getQuasarColorRgb('secondary')).toEqual([0, 255, 0])

      global.window.getComputedStyle.mockReturnValue(mockComputedStyle('#0000ff'))
      expect(getQuasarColorRgb('accent')).toEqual([0, 0, 255])
    })
  })
})
