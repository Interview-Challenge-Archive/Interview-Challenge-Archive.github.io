<template>
  <DecorativePlaceholderTile
    class="loading-skeleton-tile"
    :is-loading="true"
    :use-random-index="false"
    :fixed-index="skeletonIndex"
  >
    <template #loading-content>
      <div class="loading-skeleton-tile__content absolute-bottom full-width column justify-end text-grey-1 q-pa-md q-gutter-y-sm">
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
.loading-skeleton-tile {
  &__content {
    z-index: 1;
  }

  &__line {
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
}
</style>
