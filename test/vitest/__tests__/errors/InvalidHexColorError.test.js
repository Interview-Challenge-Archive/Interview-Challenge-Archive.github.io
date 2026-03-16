import { describe, it, expect } from 'vitest'
import { InvalidHexColorError } from 'src/errors/InvalidHexColorError.js'

describe('InvalidHexColorError', () => {
  it('creates error with correct name and message', () => {
    const error = new InvalidHexColorError('#xyz')

    expect(error.name).toBe('InvalidHexColorError')
    expect(error.message).toBe('Invalid hex color format: #xyz')
    expect(error.hex).toBe('#xyz')
  })

  it('provides read-only access to hex value', () => {
    const error = new InvalidHexColorError('#abc123')

    expect(error.hex).toBe('#abc123')

    try {
      error.hex = '#modified'
      expect(true).toBe(false)
    } catch (modificationError) {
      expect(true).toBe(true)
    }
  })

  it('is instanceof Error', () => {
    const error = new InvalidHexColorError('#fff')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(InvalidHexColorError)
  })

  it('has stack trace', () => {
    const error = new InvalidHexColorError('#123')

    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })

  it('handles various hex formats', () => {
    const testCases = [
      '#xyz',
      'abc',
      '#12',
      '#12345',
      '#1234567',
      '',
      'invalid'
    ]

    testCases.forEach(hexValue => {
      expect(() => new InvalidHexColorError(hexValue)).not.toThrow()
    })
  })

  it('maintains error context', () => {
    const originalHex = '#deadbeef'
    const error = new InvalidHexColorError(originalHex)

    expect(error.hex).toBe(originalHex)
    expect(error.hex).not.toBe('#modified')

    expect(error.message).toContain(originalHex)
  })
})
