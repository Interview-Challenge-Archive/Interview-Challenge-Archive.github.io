import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { Notify } from 'quasar'

installQuasarPlugin({
  plugins: { Notify }
})

if (typeof window !== 'undefined' && typeof window.localStorage?.getItem !== 'function') {
  const storage = new Map()
  const localStorage = {
    getItem: (key) => storage.has(key) ? storage.get(key) : null,
    setItem: (key, value) => {
      storage.set(String(key), String(value))
    },
    removeItem: (key) => {
      storage.delete(String(key))
    },
    clear: () => {
      storage.clear()
    }
  }

  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    configurable: true
  })
}
