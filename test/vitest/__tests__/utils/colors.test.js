import { describe, it, expect } from 'vitest'
import { hexToRgb } from '../../../src/utils/colors.js'

describe('hexToRgb', () => {
  it('converts 3-digit hex to RGB', () => {
    expect(hexToRgb('#f00')).toEqual([255, 0, 0])
    expect(hexToRgb('#ff0')).toEqual([255, 255, 0])
    expect(hexToRgb('#fff')).toEqual([255, 255, 255])
  })

  it('converts 3-digit hex without # to RGB', () => {
    expect(hexToRgb('f00')).toEqual([255, 0, 0])
    expect(hexToRgb('ff0')).toEqual([255, 255, 0])
    expect(hexToRgb('fff')).toEqual([255, 255, 255])
  })

  it('converts 6-digit hex to RGB', () => {
    expect(hexToRgb('#ff0000')).toEqual([255, 0, 0])
    expect(hexToRgb('#00ff00')).toEqual([0, 255, 0])
    expect(hexToRgb('#0000ff')).toEqual([0, 0, 255])
    expect(hexToRgb('#ffffff')).toEqual([255, 255, 255])
  })

  it('converts 6-digit hex without # to RGB', () => {
    expect(hexToRgb('ff0000')).toEqual([255, 0, 0])
    expect(hexToRgb('00ff00')).toEqual([0, 255, 0])
    expect(hexToRgb('0000ff')).toEqual([0, 0, 255])
    expect(hexToRgb('ffffff')).toEqual([255, 255, 255])
  })

  it('converts 8-digit hex to RGB (ignoring alpha)', () => {
    expect(hexToRgb('#ff0000ff')).toEqual([255, 0, 0])
    expect(hexToRgb('#00ff00ff')).toEqual([0, 255, 0])
    expect(hexToRgb('#0000ffff')).toEqual([0, 0, 255])
    expect(hexToRgb('#ffffffff')).toEqual([255, 255, 255])
  })

  it('converts 8-digit hex without # to RGB (ignoring alpha)', () => {
    expect(hexToRgb('ff0000ff')).toEqual([255, 0, 0])
    expect(hexToRgb('00ff00ff')).toEqual([0, 255, 0])
    expect(hexToRgb('0000ffff')).toEqual([0, 0, 255])
    expect(hexToRgb('ffffffff')).toEqual([255, 255, 255])
  })

  it('handles mixed case hex values', () => {
    expect(hexToRgb('#FF0000')).toEqual([255, 0, 0])
    expect(hexToRgb('#Ff0000')).toEqual([255, 0, 0])
    expect(hexToRgb('#ABCDEF')).toEqual([171, 205, 239])
    expect(hexToRgb('abcdef')).toEqual([171, 205, 239])
  })

  it('throws InvalidHexColorError for invalid formats', () => {
    expect(() => hexToRgb('#xyz')).toThrow()
    expect(() => hexToRgb('xyz')).toThrow()
    expect(() => hexToRgb('#12')).toThrow()
    expect(() => hexToRgb('#12345')).toThrow()
    expect(() => hexToRgb('#1234567')).toThrow()
    expect(() => hexToRgb('')).toThrow()
  })

  it('throws InvalidHexColorError with correct properties', () => {
    try {
      hexToRgb('#invalid')
    } catch (error) {
      expect(error.name).toBe('InvalidHexColorError')
      expect(error.message).toContain('Invalid hex color format: #invalid')
      expect(error.hex).toBe('#invalid')
    }
  })
})
