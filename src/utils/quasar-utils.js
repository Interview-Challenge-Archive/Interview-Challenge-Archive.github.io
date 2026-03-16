import { hexToRgb } from './colors.js'

export const getQuasarVariable = (variableName) => {
  if (typeof window === 'undefined') return ''
  
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--q-${variableName}`)
    .trim()
}

export const getQuasarColorRgb = (colorName) => {
  const cssVariable = getQuasarVariable(colorName)
  
  if (cssVariable.startsWith('#')) {
    return hexToRgb(cssVariable)
  }
  
  return [25, 118, 210]
}
