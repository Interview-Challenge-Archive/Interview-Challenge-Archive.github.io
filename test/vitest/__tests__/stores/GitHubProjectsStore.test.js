import { createPinia, setActivePinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp, nextTick } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'

describe('useGitHubProjectsStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads the first page of projects and preserves pagination state', async () => {
    const store = useGitHubProjectsStore()

    const loadPromise = store.loadInitialItems()

    await vi.advanceTimersByTimeAsync(420)
    await loadPromise

    expect(store.hasInitialized).toBe(true)
    expect(store.isLoading).toBe(false)
    expect(store.lastLoadedIndex).toBe(2)
    expect(store.items).toHaveLength(2)
    expect(store.items[0].projectPath).toBe('mekdrop/frontend-interview-tracks')
    expect(store.hasMore).toBe(true)
  })

  it('finds projects by route regardless of owner or repo casing', () => {
    const store = useGitHubProjectsStore()

    expect(store.projectByRoute('MEKDROP', 'SYSTEM-DESIGN-VAULT')?.id).toBe('system-design-vault')
    expect(store.projectByRoute('missing', 'project')).toBeNull()
  })

  it('does not persist state through the Pinia persisted state plugin', async () => {
    const setItemSpy = vi.spyOn(window.localStorage, 'setItem')
    const app = createApp({})
    const pinia = createPinia()

    pinia.use(piniaPluginPersistedstate)
    app.use(pinia)
    setActivePinia(pinia)

    const store = useGitHubProjectsStore(pinia)
    const loadPromise = store.loadInitialItems()

    await vi.advanceTimersByTimeAsync(420)
    await loadPromise
    await nextTick()

    expect(setItemSpy).not.toHaveBeenCalled()
  })
})
