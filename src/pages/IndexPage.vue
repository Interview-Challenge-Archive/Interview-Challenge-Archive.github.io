<template>
  <q-page ref="pageRef" class="index-page q-pa-none">
    <section ref="tilesGridRef" class="home-tiles">
      <template v-for="tile in renderedTiles" :key="tile.id">
        <HomeProjectTile
          v-if="tile.type === 'project'"
          :project-path="tile.projectPath"
          :title="tile.title"
          :subtitle="tile.subtitle"
          :aria-label="`Open ${tile.title}`"
          :background-image="tile.backgroundImage"
          :transition-name="tile.transitionName"
          @select="openProject(tile)"
        />

        <LoadingSkeletonTile
          v-else-if="tile.type === 'loading'"
          :background-image="tile.backgroundImage"
        />

        <DecorativePlaceholderTile
          v-else
          :background-image="tile.backgroundImage"
        />
      </template>
    </section>

    <div v-if="showLoadMoreIndicator" class="home-load-more text-grey-1 q-pt-md q-px-md q-pb-sm" aria-live="polite">
      <q-spinner-dots size="32px" color="white" />
      <span class="home-load-more__label text-uppercase text-grey-2">{{ t('home.loadingMore') }}</span>
    </div>

    <div v-if="!isLastRowDecorative" ref="loadMoreSentinelRef" class="home-tiles__sentinel" aria-hidden="true" />
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMeta } from 'quasar'
import DecorativePlaceholderTile from 'src/components/home-tiles/DecorativePlaceholderTile.vue'
import HomeProjectTile from 'src/components/home-tiles/HomeProjectTile.vue'
import LoadingSkeletonTile from 'src/components/home-tiles/LoadingSkeletonTile.vue'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'
import { clamp } from 'src/utils/math'
import { navigateWithTransition } from 'src/utils/navigation'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const githubProjectsStore = useGitHubProjectsStore()
const { catalog, items: tiles, hasMore, isLoading } = storeToRefs(githubProjectsStore)

const pageRef = ref(null)
const tilesGridRef = ref(null)
const loadMoreSentinelRef = ref(null)
const pageWidth = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)
const viewportHeight = ref(typeof window === 'undefined' ? 900 : window.innerHeight)
const renderedColumnCount = ref(0)
const tilesGridViewportTop = ref(0)

const placeholderPalettes = [
  ['var(--home-placeholder-palette-1-primary)', 'var(--home-placeholder-palette-1-secondary)', 'var(--home-placeholder-palette-1-accent)'],
  ['var(--home-placeholder-palette-2-primary)', 'var(--home-placeholder-palette-2-secondary)', 'var(--home-placeholder-palette-2-accent)'],
  ['var(--home-placeholder-palette-3-primary)', 'var(--home-placeholder-palette-3-secondary)', 'var(--home-placeholder-palette-3-accent)'],
  ['var(--home-placeholder-palette-4-primary)', 'var(--home-placeholder-palette-4-secondary)', 'var(--home-placeholder-palette-4-accent)'],
  ['var(--home-placeholder-palette-5-primary)', 'var(--home-placeholder-palette-5-secondary)', 'var(--home-placeholder-palette-5-accent)']
]

const buildPlaceholderBackground = (index) => {
  const [primary, secondary, accent] = placeholderPalettes[index % placeholderPalettes.length]

  return [
    `radial-gradient(circle at 20% 20%, ${primary} 0%, var(--home-placeholder-clear) 52%)`,
    `radial-gradient(circle at 78% 32%, ${secondary} 0%, var(--home-placeholder-clear) 48%)`,
    `linear-gradient(145deg, ${accent} 0%, var(--home-placeholder-depth) 100%)`
  ].join(', ')
}

const getPageElement = () => pageRef.value?.$el ?? pageRef.value
const getTilesGridElement = () => tilesGridRef.value?.$el ?? tilesGridRef.value

const updatePageMetrics = () => {
  if (typeof window === 'undefined') {
    return
  }

  const pageElement = getPageElement()
  const tilesGridElement = getTilesGridElement()

  pageWidth.value = tilesGridElement?.clientWidth || pageElement?.clientWidth || window.innerWidth
  viewportHeight.value = window.innerHeight

  if (tilesGridElement) {
    const gridTemplateColumns = window.getComputedStyle(tilesGridElement).gridTemplateColumns
    const columns = gridTemplateColumns === 'none'
      ? []
      : gridTemplateColumns.split(' ').filter(Boolean)

    renderedColumnCount.value = columns.length || Math.max(1, Math.floor(pageWidth.value / 460))
    tilesGridViewportTop.value = Math.max(0, tilesGridElement.getBoundingClientRect().top)
    return
  }

  renderedColumnCount.value = Math.max(1, Math.floor(pageWidth.value / 460))
  tilesGridViewportTop.value = 0
}

let pageResizeObserver
let loadMoreObserver
let isFillingViewport = false

const selectedQuery = computed(() => {
  const query = Array.isArray(route.query.query) ? route.query.query[0] : route.query.query

  return typeof query === 'string' ? query.trim() : ''
})
const selectedLabels = computed(() => {
  const labels = Array.isArray(route.query.label)
    ? route.query.label
    : (route.query.label ? [route.query.label] : [])

  return Array.from(new Set(labels
    .filter((label) => typeof label === 'string')
    .map((label) => label.trim())
    .filter(Boolean)))
})
const hasActiveSearch = computed(() => Boolean(selectedQuery.value) || selectedLabels.value.length > 0)
const displayedTiles = computed(() => {
  if (!hasActiveSearch.value) {
    return tiles.value
  }

  const normalizedQuery = selectedQuery.value.toLowerCase()
  const normalizedSelectedLabels = selectedLabels.value.map((label) => label.toLowerCase())

  return catalog.value.filter((project) => {
    const projectLabels = [
      ...(project.tags ?? []),
      ...(project.languages ?? [])
    ].map((label) => label.toLowerCase())
    const matchesQuery = !normalizedQuery || [project.title, project.description]
      .some((value) => String(value ?? '').toLowerCase().includes(normalizedQuery))
    const matchesLabels = !normalizedSelectedLabels.length || normalizedSelectedLabels.some((label) => (
      projectLabels.includes(label)
    ))

    return matchesQuery && matchesLabels
  })
})

useMeta(() => {
  let title = 'Interview Challenge Archive'
  let description = 'Browse practical UI exercises, framework prompts, and implementation walkthroughs.'

  if (selectedQuery.value || selectedLabels.value.length) {
    const filters = []
    if (selectedQuery.value) filters.push(`"${selectedQuery.value}"`)
    if (selectedLabels.value.length) filters.push(selectedLabels.value.join(', '))

    title = `Search for ${filters.join(' in ')} | Interview Challenge Archive`
    description = `Showing ${displayedTiles.value.length} projects matching your search criteria.`
  }

  return {
    title,
    meta: {
      description: { name: 'description', content: description },
      ogTitle: { property: 'og:title', content: title },
      ogDescription: { property: 'og:description', content: description }
    }
  }
})

const visibleColumnCount = computed(() => renderedColumnCount.value || Math.max(1, Math.floor(pageWidth.value / 460)))
const tileHeight = computed(() => (pageWidth.value <= 680 ? 240 : clamp(viewportHeight.value * 0.34, 280, 420)))
const availableViewportHeight = computed(() => {
  const dockHeight = 64
  return viewportHeight.value - tilesGridViewportTop.value - dockHeight
})
const minimumVisibleRowCount = computed(() => Math.max(1, Math.ceil(availableViewportHeight.value / tileHeight.value)))
const minimumTileCount = computed(() => minimumVisibleRowCount.value * visibleColumnCount.value)
const loadingSkeletonCount = computed(() => {
  if (hasActiveSearch.value || !isLoading.value) {
    return 0
  }

  const rowMultiplier = displayedTiles.value.length ? 1 : 2

  return Math.max(visibleColumnCount.value * rowMultiplier, 2)
})

const loadingSkeletonTiles = computed(() => Array.from({ length: loadingSkeletonCount.value }, (_, index) => ({
  id: `placeholder-${tiles.value.length}-${index}`,
  backgroundImage: buildPlaceholderBackground(index),
  isPlaceholder: true
})))
const contentTileCount = computed(() => displayedTiles.value.length + loadingSkeletonTiles.value.length)
const contentRowCount = computed(() => {
  if (visibleColumnCount.value <= 0) {
    return 0
  }

  return Math.ceil(contentTileCount.value / visibleColumnCount.value)
})
const contentHeightActual = computed(() => contentRowCount.value * tileHeight.value)
const shouldScrollForContent = computed(() => contentHeightActual.value > availableViewportHeight.value + 1)

const showLoadMoreIndicator = computed(() => !hasActiveSearch.value && isLoading.value && displayedTiles.value.length > 0)
const decorativePlaceholderCount = computed(() => {
  if (isLoading.value || (!hasActiveSearch.value && hasMore.value)) {
    return 0
  }

  if (shouldScrollForContent.value) {
    // If scrolling is needed for real content, only add placeholders to complete the last row
    return (visibleColumnCount.value - (contentTileCount.value % visibleColumnCount.value)) % visibleColumnCount.value
  }

  // Otherwise, fill the viewport up to the minimum tile count
  return Math.max(0, minimumTileCount.value - contentTileCount.value)
})
const decorativePlaceholderTiles = computed(() => Array.from({ length: decorativePlaceholderCount.value }, (_, index) => ({
  id: `decorative-placeholder-${contentTileCount.value}-${index}`,
  backgroundImage: buildPlaceholderBackground(contentTileCount.value + index),
  isPlaceholder: true
})))
const renderedTiles = computed(() => ([
  ...displayedTiles.value.map((tile) => ({
    ...tile,
    type: 'project'
  })),
  ...loadingSkeletonTiles.value.map((tile) => ({
    ...tile,
    type: 'loading'
  })),
  ...decorativePlaceholderTiles.value.map((tile) => ({
    ...tile,
    type: 'decorative'
  }))
]))

const isLastRowDecorative = computed(() => {
  if (renderedTiles.value.length === 0 || visibleColumnCount.value <= 0) {
    return false
  }

  const tiles = renderedTiles.value
  const cols = visibleColumnCount.value
  const totalTiles = tiles.length
  const lastRowStartIndex = Math.floor((totalTiles - 1) / cols) * cols
  const lastRowTiles = tiles.slice(lastRowStartIndex)

  // Condition 1: The last rendered row is entirely decorative placeholders
  const isLastRowEntirelyDecorative = lastRowTiles.length > 0 && lastRowTiles.every((tile) => tile.type === 'decorative')

  if (!isLastRowEntirelyDecorative) {
    return false
  }

  // Condition 2: All non-decorative tiles (projects/loading) must fit in the viewport.
  // We don't want to hide the scrollbar if it's needed to see actual content.
  const lastRealRelativeIndex = [...tiles].reverse().findIndex((tile) => tile.type !== 'decorative')
  if (lastRealRelativeIndex === -1) {
    return true // Only decorative tiles exist
  }

  const lastRealIndex = tiles.length - 1 - lastRealRelativeIndex
  const lastRealRowIndex = Math.floor(lastRealIndex / cols)
  const contentHeight = (lastRealRowIndex + 1) * tileHeight.value

  // Hide scrollbar only if the content height fits within the available viewport height
  return contentHeight <= availableViewportHeight.value + 1 // Add 1px buffer for subpixel rendering
})

function isSentinelNearViewport () {
  if (typeof window === 'undefined' || !loadMoreSentinelRef.value) {
    return false
  }

  const sentinelBounds = loadMoreSentinelRef.value.getBoundingClientRect()

  return sentinelBounds.top <= window.innerHeight + 320
}

async function fillViewportWithItems () {
  if (hasActiveSearch.value || isFillingViewport || typeof window === 'undefined') {
    return
  }

  isFillingViewport = true

  try {
    await nextTick()

    while (hasMore.value && !isLoading.value && isSentinelNearViewport()) {
      await githubProjectsStore.loadMoreItems()
      await nextTick()
    }
  } finally {
    isFillingViewport = false
  }
}

async function initializeHomeTiles () {
  if (hasActiveSearch.value) {
    loadMoreObserver?.disconnect()
    return
  }

  await githubProjectsStore.ensureItemsLoaded()
  observeLoadMoreSentinel()
  await fillViewportWithItems()
}

function observeLoadMoreSentinel () {
  if (hasActiveSearch.value || typeof IntersectionObserver === 'undefined' || !loadMoreSentinelRef.value) {
    return
  }

  loadMoreObserver?.disconnect()
  loadMoreObserver = new IntersectionObserver((entries) => {
    const isSentinelVisible = entries.some((entry) => entry.isIntersecting)

    if (isSentinelVisible && hasMore.value && !isLoading.value) {
      void fillViewportWithItems()
    }
  }, {
    rootMargin: '0px 0px 320px 0px'
  })

  loadMoreObserver.observe(loadMoreSentinelRef.value)
}

async function openProject (tile) {
  await navigateWithTransition(router, tile.routeLocation)
}

onMounted(() => {
  updatePageMetrics()

  const pageElement = getPageElement()
  const tilesGridElement = getTilesGridElement()

  if (typeof ResizeObserver !== 'undefined' && pageElement) {
    pageResizeObserver = new ResizeObserver(updatePageMetrics)
    pageResizeObserver.observe(pageElement)

    if (tilesGridElement && tilesGridElement !== pageElement) {
      pageResizeObserver.observe(tilesGridElement)
    }
  }

  window.addEventListener('resize', updatePageMetrics)

  if (!hasActiveSearch.value) {
    void initializeHomeTiles()
  }
})

watch(hasActiveSearch, (hasFilter, hadFilter) => {
  if (hasFilter) {
    loadMoreObserver?.disconnect()
    return
  }

  if (hadFilter) {
    void initializeHomeTiles()
  }
})

watch(isLastRowDecorative, (val) => {
  if (typeof document !== 'undefined') {
    if (val) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }
}, { immediate: true })

onBeforeUnmount(() => {
  pageResizeObserver?.disconnect()
  loadMoreObserver?.disconnect()
  window.removeEventListener('resize', updatePageMetrics)

  if (typeof document !== 'undefined') {
    document.body.classList.remove('no-scroll')
  }
})
</script>

<style scoped lang="scss">
.index-page {
  --home-placeholder-palette-1-primary: #{rgba($info, 0.88)};
  --home-placeholder-palette-1-secondary: #{rgba($primary, 0.7)};
  --home-placeholder-palette-1-accent: #{rgba($dark-page, 0.2)};
  --home-placeholder-palette-2-primary: #{rgba($accent, 0.82)};
  --home-placeholder-palette-2-secondary: #{rgba($secondary, 0.64)};
  --home-placeholder-palette-2-accent: #{rgba($dark-page, 0.22)};
  --home-placeholder-palette-3-primary: #{rgba($secondary, 0.84)};
  --home-placeholder-palette-3-secondary: #{rgba($primary, 0.62)};
  --home-placeholder-palette-3-accent: #{rgba($dark-page, 0.18)};
  --home-placeholder-palette-4-primary: #{rgba($warning, 0.8)};
  --home-placeholder-palette-4-secondary: #{rgba($accent, 0.66)};
  --home-placeholder-palette-4-accent: #{rgba($dark-page, 0.18)};
  --home-placeholder-palette-5-primary: #{rgba($primary, 0.82)};
  --home-placeholder-palette-5-secondary: #{rgba($info, 0.6)};
  --home-placeholder-palette-5-accent: #{rgba($dark-page, 0.2)};
  --home-placeholder-clear: #{rgba($grey-1, 0)};
  --home-placeholder-depth: #{rgba($dark-page, 0.58)};
  transition: opacity 0.3s ease;
}

.home-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 76px;
  background: linear-gradient(180deg, rgba($dark-page, 0) 0%, rgba($dark-page, 0.56) 100%);

  &__label {
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: 0.08em;
  }
}

.home {
  &-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 460px), 1fr));
    gap: 0;

    &__sentinel {
      width: 100%;
      height: 1px;
    }
  }

}
</style>

