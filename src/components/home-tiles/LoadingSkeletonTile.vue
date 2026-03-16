<template>
  <DecorativePlaceholderTile 
    :is-loading="true" 
    :use-random-index="false"
    :fixed-index="skeletonIndex"
  >
    <template #loading-content>
      <div class="loading-skeleton-tile__content absolute-position text-grey-1 q-pa-md">
        <q-skeleton dark type="text" class="loading-skeleton-tile__line loading-skeleton-tile__line--meta" />
        <q-skeleton dark type="rect" class="loading-skeleton-tile__line loading-skeleton-tile__line--title" />
        <q-skeleton dark type="text" class="loading-skeleton-tile__line loading-skeleton-tile__line--subtitle" />
        <q-skeleton dark type="text" class="loading-skeleton-tile__line loading-skeleton-tile__line--subtitle-short" />
      </div>
    </template>
  </DecorativePlaceholderTile>
</template>

<script setup>
import { computed } from 'vue'
import DecorativePlaceholderTile from './DecorativePlaceholderTile.vue'
import colorConfig from 'src/config/colors.yml'

const skeletonIndex = computed(() => {
  return Math.floor(Math.random() * colorConfig.placeholders.available_colors.length)
})
</script>

<style scoped lang="scss">
.loading-skeleton-tile__content {
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: flex-end;
}

.loading-skeleton-tile__line {
  z-index: 1;

  &--meta {
    width: 40%;
    max-width: 180px;
  }

  &--title {
    width: 68%;
    max-width: 320px;
    height: 32px;
  }

  &--subtitle {
    width: 84%;
    max-width: 360px;
  }

  &--subtitle-short {
    width: 56%;
    max-width: 260px;
  }
}
</style>
