import { computed, ref } from 'vue'
import { defineStore, acceptHMRUpdate } from 'pinia'
import {
  appendProjects,
  buildProjectCatalog,
  findProjectByRoute,
  getNextLoadedIndex
} from '../utils/project-catalog'

const PROJECTS_PAGE_SIZE = 2
const PROJECTS_LOAD_DELAY_MS = 420

const rawProjects = [
  {
    id: 'frontend-interview-tracks',
    title: 'Frontend interview tracks',
    subtitle: 'Browse practical UI exercises, framework prompts, and implementation walkthroughs.',
    description: 'A curated front-end project archive designed to make take-home challenges and implementation prompts instantly legible. The focus is on showing what the repository is about, which stack it uses, and what sort of hiring signal it represents the moment somebody opens it.',
    storyline: [
      'The detail page is built to feel closer to an IMDb profile than a plain card grid: the project artwork anchors the left rail, the metadata stays concise underneath it, and the main story sits on the right in oversized, easy-to-scan typography.',
      'That makes the jump from the homepage feel like opening the project itself rather than drilling into a generic subpage.'
    ],
    githubUrl: 'https://github.com/mekdrop/frontend-interview-tracks',
    languages: [ 'Vue 3', 'JavaScript' ],
    tags: [ 'UI', 'Accessibility', 'Animations', 'Hiring tasks' ],
    stack: [ 'Quasar', 'Pinia', 'SCSS' ],
    backgroundImage: 'linear-gradient(180deg, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.62) 100%), url(https://picsum.photos/1600/1200?random=11)'
  },
  {
    id: 'system-design-vault',
    title: 'System design vault',
    subtitle: 'Collect architecture scenarios, trade-off notes, and reusable design patterns.',
    description: 'This project frames large-scale architecture material like a featured title page: high-level positioning first, then the supporting facts underneath. It is meant to help somebody decide within seconds whether the repository covers scalability, trade-offs, interview prep, or reusable reference material.',
    storyline: [
      'Instead of flattening everything into one grid tile, the project page gives the design notes room to breathe with a wider title block, a large descriptive lead, and compact metadata columns for the stack and tags.',
      'The result feels much closer to a showcase page for a repository than a simple category listing.'
    ],
    githubUrl: 'https://github.com/mekdrop/system-design-vault',
    languages: [ 'Markdown', 'Mermaid' ],
    tags: [ 'Architecture', 'Scalability', 'Trade-offs', 'Notes' ],
    stack: [ 'Docs as code', 'Diagrams', 'Reference library' ],
    backgroundImage: 'linear-gradient(180deg, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.62) 100%), url(https://picsum.photos/1600/1200?random=12)'
  },
  {
    id: 'coding-challenge-sets',
    title: 'Coding challenge sets',
    subtitle: 'Keep algorithm rounds, timed tasks, and problem-solving drills in one place.',
    description: 'A project page for coding exercises should feel immediate and high-signal, so this one emphasizes the repo identity, the technical surface area, and the kind of challenge collection behind it. The left panel acts like cover art, while the right side tells the story in larger editorial copy.',
    storyline: [
      'That structure makes it easy to understand whether the repository is about live coding, take-home work, or reusable practice problems without forcing the user to read a full README first.',
      'Short facts like tags and language stay visible in columns below the poster block so the page still reads like a compact project profile.'
    ],
    githubUrl: 'https://github.com/mekdrop/coding-challenge-sets',
    languages: [ 'JavaScript', 'Python' ],
    tags: [ 'Algorithms', 'Timed tasks', 'Practice', 'Problem solving' ],
    stack: [ 'CLI scripts', 'Examples', 'Notes' ],
    backgroundImage: 'linear-gradient(180deg, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.62) 100%), url(https://picsum.photos/1600/1200?random=13)'
  },
  {
    id: 'company-specific-notes',
    title: 'Company-specific notes',
    subtitle: 'Organize hiring process insights, take-home tasks, and follow-up preparation.',
    description: 'This repository concept is presented like a project dossier: a memorable visual block on the left, quick production facts below it, and the full narrative on the right. It is designed to feel like opening a feature page about the project instead of expanding a standard list item.',
    storyline: [
      'Because company-prep material is often narrative-heavy, the wider description area helps tell the story of what the project contains and why it matters before somebody dives into its files.',
      'That larger treatment is what gives the page the movie-profile feeling you described.'
    ],
    githubUrl: 'https://github.com/mekdrop/company-specific-notes',
    languages: [ 'Markdown', 'JSON' ],
    tags: [ 'Research', 'Hiring process', 'Take-home tasks', 'Prep' ],
    stack: [ 'Notes', 'Templates', 'Link archive' ],
    backgroundImage: 'linear-gradient(180deg, rgba(15, 23, 42, 0.04) 0%, rgba(15, 23, 42, 0.62) 100%), url(https://picsum.photos/1600/1200?random=14)'
  }
]

const allProjects = buildProjectCatalog(rawProjects)

function wait (duration) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, duration)
  })
}

export const useGitHubProjectsStore = defineStore('github-projects', () => {
  const catalog = ref(allProjects)
  const items = ref([])
  const isLoading = ref(false)
  const hasInitialized = ref(false)
  const lastLoadedIndex = ref(0)

  const hasMore = computed(() => lastLoadedIndex.value < catalog.value.length)

  function projectByRoute (owner, repo) {
    return findProjectByRoute(catalog.value, owner, repo)
  }

  async function ensureItemsLoaded () {
    if (hasInitialized.value && items.value.length) {
      return
    }

    await loadInitialItems()
  }

  async function loadInitialItems () {
    items.value = []
    lastLoadedIndex.value = 0
    hasInitialized.value = true

    await loadMoreItems()
  }

  async function loadMoreItems () {
    if (isLoading.value || !hasMore.value) {
      return
    }

    isLoading.value = true

    try {
      await wait(PROJECTS_LOAD_DELAY_MS)

      const nextLoadedIndex = getNextLoadedIndex(
        lastLoadedIndex.value,
        catalog.value.length,
        PROJECTS_PAGE_SIZE
      )

      items.value = appendProjects(
        items.value,
        catalog.value,
        lastLoadedIndex.value,
        nextLoadedIndex
      )
      lastLoadedIndex.value = nextLoadedIndex
    } finally {
      isLoading.value = false
    }
  }

  return {
    catalog,
    items,
    isLoading,
    hasInitialized,
    lastLoadedIndex,
    hasMore,
    projectByRoute,
    ensureItemsLoaded,
    loadInitialItems,
    loadMoreItems
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGitHubProjectsStore, import.meta.hot))
}
