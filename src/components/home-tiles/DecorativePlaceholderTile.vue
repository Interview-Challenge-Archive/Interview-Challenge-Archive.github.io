<template>
  <q-card
    flat
    square
    class="decorative-placeholder-tile"
    :class="{ 'decorative-placeholder-tile--loading': isLoading }"
    :style="{ '--tile-background': computedBackgroundImage }"
    :aria-hidden="!isLoading"
  >
    <slot v-if="isLoading" name="loading-content" />
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { getQuasarColorRgb } from 'src/utils/quasar-utils.js'
import colorConfig from 'src/config/colors.yml'

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  useRandomIndex: {
    type: Boolean,
    default: true
  },
  fixedIndex: {
    type: Number,
    default: null
  }
})

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

const paletteIndex = computed(() => {
  if (props.fixedIndex !== null) {
    return props.fixedIndex
  }

  if (props.useRandomIndex) {
    return Math.floor(Math.random() * colorConfig.placeholders.available_colors.length)
  }

  return 0
})

const computedBackgroundImage = computed(() => {
  const palette = generatePalette(paletteIndex.value)

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
  background-image: var(--tile-background);
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

  &--loading {
    opacity: 1;
    filter: none;
    pointer-events: auto;

    &::after {
      @include tile.tile-overlay(linear-gradient(180deg, rgba($grey-1, 0.06) 0%, rgba($dark-page, 0.24) 100%));
    }
  }

  @media (max-width: 680px) {
    min-height: 240px;
  }
}
</style>
