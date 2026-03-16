import { InvalidHexColorError } from '../errors/InvalidHexColorError.js'

export const hexToRgb = (hex) => {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex
  
  if (cleanHex.length === 3) {
    const r = cleanHex.substring(0, 1)
    const g = cleanHex.substring(1, 2)
    const b = cleanHex.substring(2, 3)
    return [
      parseInt(r + r, 16),
      parseInt(g + g, 16),
      parseInt(b + b, 16)
    ]
  }
  
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return [r, g, b]
  }
  
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.substring(0, 2), 16)
    const g = parseInt(cleanHex.substring(2, 4), 16)
    const b = parseInt(cleanHex.substring(4, 6), 16)
    return [r, g, b]
  }
  
  throw new InvalidHexColorError(hex)
}
