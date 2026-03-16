export class InvalidHexColorError extends Error {
  #hex

  constructor(hex) {
    super(`Invalid hex color format: ${hex}`)

    this.name = 'InvalidHexColorError'
    this.#hex = hex
  }

  get hex() {
    return this.#hex
  }
}
