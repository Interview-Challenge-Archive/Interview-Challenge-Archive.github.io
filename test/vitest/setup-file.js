import { config } from '@vue/test-utils'
import { Quasar, Notify, Meta } from 'quasar'
import { vi } from 'vitest'

// Mock useMeta globally to avoid document is not defined errors when tests finish
vi.mock('quasar', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useMeta: vi.fn()
  }
})

config.global.plugins = [
  [Quasar, { plugins: { Notify, Meta } }],
  ...(config.global.plugins ?? [])
]

config.global.stubs = {
  QLayout: {
    name: 'QLayout',
    template: '<div class="q-layout" v-bind="$attrs"><slot /></div>'
  },
  QPageContainer: {
    name: 'QPageContainer',
    template: '<div class="q-page-container" v-bind="$attrs"><slot /></div>'
  },
  QPage: {
    name: 'QPage',
    template: '<div class="q-page" v-bind="$attrs"><slot /></div>'
  },
  QFooter: {
    name: 'QFooter',
    template: '<footer class="q-footer" v-bind="$attrs"><slot /></footer>'
  },
  ...(config.global.stubs ?? {})
}

function createStorageMock () {
  const storage = new Map()

  return {
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
}

if (typeof window !== 'undefined' && typeof window.localStorage?.getItem !== 'function') {
  const localStorage = createStorageMock()

  Object.defineProperty(window, 'localStorage', {
    value: localStorage,
    configurable: true
  })
}

if (typeof window !== 'undefined' && typeof window.sessionStorage?.getItem !== 'function') {
  const sessionStorage = createStorageMock()

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorage,
    configurable: true
  })
}
