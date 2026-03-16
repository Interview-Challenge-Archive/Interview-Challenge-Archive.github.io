import { hexToRgb } from './colors.js'
import colorConfig from '../config/colors.yml'

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
  
  return colorConfig.fallback.default_rgb
}
