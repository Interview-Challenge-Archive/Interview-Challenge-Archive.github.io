<template>
  <q-page ref="pageRef" class="index-page">
    <section ref="tilesGridRef" class="home-tiles home-tiles--content">
      <HomeProjectTile
        v-for="tile in displayedTiles"
        :key="tile.id"
        :project-path="tile.projectPath"
        :title="tile.title"
        :subtitle="tile.subtitle"
        :aria-label="`Open ${tile.title}`"
        :background-image="tile.backgroundImage"
        :transition-name="tile.transitionName"
        @select="openProject(tile)"
      />

      <DecorativePlaceholderTile
        v-for="tile in trailingDecorativePlaceholderTiles"
        :key="tile.id"
        :background-image="tile.backgroundImage"
      />

      <LoadingSkeletonTile
        v-for="tile in loadingSkeletonTiles"
        :key="tile.id"
        :background-image="tile.backgroundImage"
      />
    </section>

    <section
      v-if="showDecorativePlaceholderLayer"
      class="home-tiles home-tiles--placeholder-layer"
      :style="decorativePlaceholderLayerStyle"
      aria-hidden="true"
    >
      <DecorativePlaceholderTile
        v-for="tile in decorativePlaceholderTiles"
        :key="tile.id"
        :background-image="tile.backgroundImage"
      />
    </section>

    <div v-if="showLoadMoreIndicator" class="home-load-more" aria-live="polite">
      <q-spinner-dots size="32px" color="white" />
      <span class="home-load-more__label">{{ t('home.loadingMore') }}</span>
    </div>

    <div ref="loadMoreSentinelRef" class="home-tiles__sentinel" aria-hidden="true" />
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import DecorativePlaceholderTile from 'src/components/home-tiles/DecorativePlaceholderTile.vue'
import HomeProjectTile from 'src/components/home-tiles/HomeProjectTile.vue'
import LoadingSkeletonTile from 'src/components/home-tiles/LoadingSkeletonTile.vue'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const githubProjectsStore = useGitHubProjectsStore()
const { catalog, items: tiles, hasMore, isLoading } = storeToRefs(githubProjectsStore)

const pageRef = ref(null)
const tilesGridRef = ref(null)
const loadMoreSentinelRef = ref(null)
const pageWidth = ref(typeof window === 'undefined' ? 1280 : window.innerWidth)
const pageHeight = ref(typeof window === 'undefined' ? 900 : window.innerHeight)
const viewportHeight = ref(typeof window === 'undefined' ? 900 : window.innerHeight)
const renderedColumnCount = ref(0)
const tilesGridTop = ref(0)
const tilesGridHeight = ref(0)

const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

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

  pageWidth.value = pageElement?.clientWidth || window.innerWidth
  pageHeight.value = pageElement?.clientHeight || window.innerHeight
  viewportHeight.value = window.innerHeight

  if (tilesGridElement) {
    const gridTemplateColumns = window.getComputedStyle(tilesGridElement).gridTemplateColumns
    const columns = gridTemplateColumns.split(' ').filter(Boolean)

    renderedColumnCount.value = columns.length || 1
    tilesGridTop.value = tilesGridElement.offsetTop
    tilesGridHeight.value = tilesGridElement.offsetHeight
  }
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

const visibleColumnCount = computed(() => renderedColumnCount.value || Math.max(1, Math.floor(pageWidth.value / 460)))
const tileHeight = computed(() => (pageWidth.value <= 680 ? 240 : clamp(viewportHeight.value * 0.34, 280, 420)))
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
const trailingDecorativePlaceholderCount = computed(() => {
  if (isLoading.value || !displayedTiles.value.length || (!hasActiveSearch.value && hasMore.value)) {
    return 0
  }

  const remainder = displayedTiles.value.length % visibleColumnCount.value

  return remainder === 0 ? 0 : visibleColumnCount.value - remainder
})
const trailingDecorativePlaceholderTiles = computed(() => Array.from({ length: trailingDecorativePlaceholderCount.value }, (_, index) => ({
  id: `trailing-placeholder-${displayedTiles.value.length}-${index}`,
  backgroundImage: buildPlaceholderBackground(displayedTiles.value.length + index),
  isPlaceholder: true
})))
const showLoadMoreIndicator = computed(() => !hasActiveSearch.value && isLoading.value && displayedTiles.value.length > 0)
const decorativePlaceholderTop = computed(() => tilesGridTop.value + tilesGridHeight.value)
const remainingHeight = computed(() => Math.max(0, pageHeight.value - decorativePlaceholderTop.value))
const decorativePlaceholderRowCount = computed(() => {
  if (isLoading.value || (!hasActiveSearch.value && hasMore.value) || !displayedTiles.value.length || !remainingHeight.value) {
    return 0
  }

  return Math.max(1, Math.ceil(remainingHeight.value / tileHeight.value))
})
const decorativePlaceholderCount = computed(() => decorativePlaceholderRowCount.value * visibleColumnCount.value)
const decorativePlaceholderTiles = computed(() => Array.from({ length: decorativePlaceholderCount.value }, (_, index) => ({
  id: `decorative-placeholder-${index}`,
  backgroundImage: buildPlaceholderBackground(index),
  isPlaceholder: true
})))
const decorativePlaceholderLayerStyle = computed(() => ({
  top: `${decorativePlaceholderTop.value}px`,
  gridTemplateRows: `repeat(${decorativePlaceholderRowCount.value}, minmax(0, 1fr))`
}))
const showDecorativePlaceholderLayer = computed(() => decorativePlaceholderTiles.value.length > 0)

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

function prefersReducedMotion () {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

async function openProject (tile) {
  if (
    typeof document !== 'undefined'
    && typeof document.startViewTransition === 'function'
    && !prefersReducedMotion()
  ) {
    document.startViewTransition(() => router.push(tile.routeLocation))
    return
  }

  await router.push(tile.routeLocation)
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

onBeforeUnmount(() => {
  pageResizeObserver?.disconnect()
  loadMoreObserver?.disconnect()
  window.removeEventListener('resize', updatePageMetrics)
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
  position: relative;
  padding: 0 !important;
}

.home-load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 76px;
  padding: 18px 20px 12px;
  color: $grey-1;
  background: linear-gradient(180deg, rgba($dark-page, 0) 0%, rgba($dark-page, 0.56) 100%);

  &__label {
    font-size: 0.92rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba($grey-1, 0.92);
  }
}

.home {
  &-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 460px), 1fr));
    gap: 0;

    &--content {
      position: relative;
      z-index: 1;
    }

    &--placeholder-layer {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    &__sentinel {
      width: 100%;
      height: 1px;
    }
  }

}
</style>

