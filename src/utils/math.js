/**
 * Clamps a number between a minimum and maximum value.
 * @param {number} value The value to clamp.
 * @param {number} min The minimum boundary.
 * @param {number} max The maximum boundary.
 * @returns {number} The clamped value.
 */
export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)
