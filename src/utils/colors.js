// Color conversion utilities

/**
 * Convert hex color to RGB array
 * @param {string} hex - Hex color string (e.g., '#1976D2' or '1976D2')
 * @returns {number[]} Array of RGB values [r, g, b]
 */
export const hexToRgb = (hex) => {
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex
  
  // Handle 3-digit hex (e.g., '#197' -> '#119977')
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
  
  // Handle 6-digit hex
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.substr(0, 2), 16)
    const g = parseInt(cleanHex.substr(2, 2), 16)
    const b = parseInt(cleanHex.substr(4, 2), 16)
    return [r, g, b]
  }
  
  // Handle 8-digit hex (with alpha)
  if (cleanHex.length === 8) {
    const r = parseInt(cleanHex.substr(0, 2), 16)
    const g = parseInt(cleanHex.substr(2, 2), 16)
    const b = parseInt(cleanHex.substr(4, 2), 16)
    return [r, g, b]
  }
  
  // Invalid hex format
  throw new Error(`Invalid hex color format: ${hex}`)
}
