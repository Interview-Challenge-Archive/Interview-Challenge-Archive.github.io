// Quasar CSS variables utilities
import { hexToRgb } from './colors.js'

/**
 * Get any Quasar CSS variable value
 * @param {string} variableName - The variable name without '--q-' prefix (e.g., 'primary', 'font-size-body')
 * @returns {string} The CSS variable value
 */
export const getQuasarVariable = (variableName) => {
  if (typeof window === 'undefined') return ''
  
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--q-${variableName}`)
    .trim()
}

/**
 * Get RGB values from Quasar CSS variables
 * @param {string} colorName - The Quasar color name (e.g., 'primary', 'secondary')
 * @returns {number[]} Array of RGB values [r, g, b]
 */
export const getQuasarColorRgb = (colorName) => {
  const cssVariable = getQuasarVariable(colorName)
  
  // Convert hex to RGB using the utility function
  if (cssVariable.startsWith('#')) {
    return hexToRgb(cssVariable)
  }
  
  // Default fallback if CSS variable is not a hex color
  return [25, 118, 210]
}
