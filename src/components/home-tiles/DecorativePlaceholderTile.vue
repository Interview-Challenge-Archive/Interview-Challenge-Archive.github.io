<template>
  <q-card
    flat
    square
    class="decorative-placeholder-tile"
    :style="{ backgroundImage: computedBackgroundImage }"
    aria-hidden="true"
  />
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

const randomPaletteIndex = computed(() => {
  return Math.floor(Math.random() * colorConfig.placeholders.available_colors.length)
})

const computedBackgroundImage = computed(() => {
  const palette = generatePalette(randomPaletteIndex.value)
  
  return [
    `radial-gradient(circle at 20% 20%, ${palette.primary} 0%, ${colorConfig.placeholders.clear_color} 52%)`,
    `radial-gradient(circle at 78% 32%, ${palette.secondary} 0%, ${colorConfig.placeholders.clear_color} 48%)`,
    `linear-gradient(145deg, ${palette.accent} 0%, ${colorConfig.placeholders.depth_color} 100%)`
  ].join(', ')
})
</script>

<style scoped lang="scss">
@use '../../css/home-tile-foundation' as tile;

.decorative-placeholder-tile {
  @include tile.tile-surface(clamp(280px, 34vh, 420px));
  opacity: 0.68;
  filter: saturate(0.62) brightness(0.92);

  &::before {
    @include tile.tile-blurred-background();
  }

  &::after {
    @include tile.tile-overlay(
      (
        linear-gradient(135deg, rgba($grey-1, 0.08) 0%, rgba($grey-1, 0) 38%),
        repeating-linear-gradient(
          -45deg,
          rgba($grey-1, 0.06) 0 14px,
          rgba($grey-1, 0) 14px 28px
        ),
        linear-gradient(180deg, rgba($grey-1, 0.04) 0%, rgba($dark-page, 0.32) 100%)
      ),
      inset 0 0 0 1px rgba($grey-1, 0.12)
    );
  }

  @media (max-width: 680px) {
    min-height: 240px;
  }
}
</style>
