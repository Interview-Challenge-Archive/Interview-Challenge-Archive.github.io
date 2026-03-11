import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'

describe('useGitHubProjectsStore', () => {
  beforeEach(() => {
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
})