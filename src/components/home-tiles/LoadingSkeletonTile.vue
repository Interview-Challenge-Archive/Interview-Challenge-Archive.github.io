<template>
  <q-card
    flat
    square
    class="loading-skeleton-tile"
    :style="{ '--tile-background': computedBackgroundImage, backgroundImage: computedBackgroundImage }"
    aria-hidden="true"
  >
    <div class="loading-skeleton-tile__content absolute-position text-grey-1 q-pa-md">
      <q-skeleton dark type="text" class="loading-skeleton-tile__line loading-skeleton-tile__line--meta" />
      <q-skeleton dark type="rect" class="loading-skeleton-tile__line loading-skeleton-tile__line--title" />
      <q-skeleton dark type="text" class="loading-skeleton-tile__line loading-skeleton-tile__line--subtitle" />
      <q-skeleton dark type="text" class="loading-skeleton-tile__line loading-skeleton-tile__line--subtitle-short" />
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { getQuasarColorRgb } from 'src/utils/quasar-utils.js'
import colorConfig from 'src/config/colors.yml'

// Generate palette rules based on Quasar colors
const generatePalette = (index) => {
  const quasarColors = colorConfig.placeholders.available_colors
  const opacityConfig = colorConfig.placeholders.opacity
  
  const colorCount = quasarColors.length
  const primaryColor = quasarColors[index % colorCount]
  const secondaryColor = quasarColors[(index + 2) % colorCount]
  
  const primaryRgb = getQuasarColorRgb(primaryColor)
  const secondaryRgb = getQuasarColorRgb(secondaryColor)
  
  return {
    primary: `rgba(${primaryRgb.join(', ')}, ${opacityConfig.primary.base + (index % 3) * opacityConfig.primary.variation})`,
    secondary: `rgba(${secondaryRgb.join(', ')}, ${opacityConfig.secondary.base + (index % 4) * opacityConfig.secondary.variation})`,
    accent: `rgba(18, 18, 18, ${opacityConfig.accent.base + (index % 3) * opacityConfig.accent.variation})`
  }
}

// Use a consistent index based on component creation for loading skeletons
const skeletonIndex = computed(() => {
  return Math.floor(Math.random() * colorConfig.placeholders.available_colors.length)
})

const computedBackgroundImage = computed(() => {
  const palette = generatePalette(skeletonIndex.value)
  
  return [
    `radial-gradient(circle at 20% 20%, ${palette.primary} 0%, ${colorConfig.placeholders.clear_color} 52%)`,
    `radial-gradient(circle at 78% 32%, ${palette.secondary} 0%, ${colorConfig.placeholders.clear_color} 48%)`,
    `linear-gradient(145deg, ${palette.accent} 0%, ${colorConfig.placeholders.depth_color} 100%)`
  ].join(', ')
})
</script>

<style scoped lang="scss">
@use '../../css/home-tile-foundation' as tile;

.loading-skeleton-tile {
  @include tile.tile-surface(clamp(280px, 34vh, 420px));

  &::before {
    @include tile.tile-blurred-background();
  }

  &::after {
    @include tile.tile-overlay(linear-gradient(180deg, rgba($grey-1, 0.06) 0%, rgba($dark-page, 0.24) 100%));
  }

  &__content {
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: flex-end;
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

  @media (max-width: 680px) {
    min-height: 240px;
  }
}
</style>
