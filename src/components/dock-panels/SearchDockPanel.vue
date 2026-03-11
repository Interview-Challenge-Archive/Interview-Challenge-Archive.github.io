<template>
  <div>
    <div class="text-h5 q-mb-sm">{{ t('dock.search.title') }}</div>
    <div class="text-body1 text-grey-7 q-mb-lg">{{ t('dock.search.description') }}</div>
    <q-input
      v-model="searchQuery"
      outlined
      clearable
      :label="t('dock.search.queryFieldLabel')"
      :hint="t('dock.search.queryHint')"
      @keyup.enter="submitSearch"
    />

    <q-select
      v-model="selectedLabels"
      class="q-mt-md"
      outlined
      clearable
      multiple
      use-chips
      use-input
      input-debounce="0"
      :options="filteredLabelOptions"
      :label="t('dock.search.labelsFieldLabel')"
      :hint="t('dock.search.labelsHint')"
      @filter="filterLabelOptions"
    />

    <div class="row justify-end q-gutter-sm q-mt-md">
      <q-btn flat no-caps :label="t('dock.search.resetAction')" @click="resetSearch" />
      <q-btn color="dark" no-caps :label="t('dock.search.action')" @click="submitSearch" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'

const emit = defineEmits(['submitted'])

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const githubProjectsStore = useGitHubProjectsStore()
const { catalog } = storeToRefs(githubProjectsStore)
const searchQuery = ref('')
const selectedLabels = ref([])
const filteredLabelOptions = ref([])

const routeQuery = computed(() => {
  const query = Array.isArray(route.query.query) ? route.query.query[0] : route.query.query

  return typeof query === 'string' ? query.trim() : ''
})

const routeLabels = computed(() => {
  const labels = Array.isArray(route.query.label)
    ? route.query.label
    : (route.query.label ? [route.query.label] : [])

  return Array.from(new Set(labels
    .filter((label) => typeof label === 'string')
    .map((label) => label.trim())
    .filter(Boolean)))
})

const allLabelOptions = computed(() => Array.from(new Set(catalog.value
  .flatMap((project) => [
    ...(project.tags ?? []),
    ...(project.languages ?? [])
  ])
  .filter(Boolean)))
  .sort((left, right) => left.localeCompare(right)))

function resetLabelOptions () {
  filteredLabelOptions.value = allLabelOptions.value
}

watch([routeQuery, routeLabels], ([query, labels]) => {
  searchQuery.value = query
  selectedLabels.value = labels
  resetLabelOptions()
}, { immediate: true })

watch(allLabelOptions, () => {
  resetLabelOptions()
}, { immediate: true })

function filterLabelOptions (inputValue, update) {
  update(() => {
    const needle = String(inputValue ?? '').trim().toLowerCase()

    filteredLabelOptions.value = !needle
      ? allLabelOptions.value
      : allLabelOptions.value.filter((label) => label.toLowerCase().includes(needle))
  })
}

async function submitSearch () {
  const query = String(searchQuery.value ?? '').trim()
  const labels = Array.from(new Set((Array.isArray(selectedLabels.value) ? selectedLabels.value : [])
    .filter((label) => typeof label === 'string')
    .map((label) => label.trim())
    .filter(Boolean)))

  const nextQuery = {}

  if (query) {
    nextQuery.query = query
  }

  if (labels.length) {
    nextQuery.label = labels
  }

  await router.push({
    name: 'home',
    query: nextQuery
  })

  emit('submitted')
}

async function resetSearch () {
  searchQuery.value = ''
  selectedLabels.value = []
  resetLabelOptions()

  await router.push({ name: 'home' })

  emit('submitted')
}
</script>
