export const hexToRgb = (hex) => {
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex
  
  if (cleanHex.length === 3) {
    const r = cleanHex.substr(0, 1)
    const g = cleanHex.substr(1, 1)
    const b = cleanHex.substr(2, 1)
    return [
      parseInt(r + r, 16),
      parseInt(g + g, 16),
      parseInt(b + b, 16)
    ]
  }
  
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substr(0, 2), 16)
    const g = parseInt(cleanHex.substr(2, 2), 16)
    const b = parseInt(cleanHex.substr(4, 2), 16)
    return [r, g, b]
  }
  
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.substr(0, 2), 16)
    const g = parseInt(cleanHex.substr(2, 2), 16)
    const b = parseInt(cleanHex.substr(4, 2), 16)
    return [r, g, b]
  }
  
  throw new Error(`Invalid hex color format: ${hex}`)
}
