import { installQuasarPlugin } from '@quasar/quasar-app-extension-testing-unit-vitest'
import { Notify, Meta } from 'quasar'
import { vi } from 'vitest'

// Mock useMeta globally to avoid document is not defined errors when tests finish
vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useMeta: vi.fn()
  }
})

installQuasarPlugin({
  plugins: { Notify, Meta }
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
