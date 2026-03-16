<template>
  <q-card
    flat
    square
    class="home-project-tile home-tile home-tile--action q-pa-none"
    role="button"
    tabindex="0"
    :aria-label="ariaLabel"
    :style="{ backgroundImage, 'view-transition-name': transitionName }"
    @click="emitSelect"
    @keydown.enter.prevent="emitSelect"
    @keydown.space.prevent="emitSelect"
  >
    <div class="home-project-tile__content home-tile__content absolute-bottom text-grey-1 q-pa-md">
      <div class="home-project-tile__meta home-tile__meta text-uppercase text-grey-4 q-mb-sm">{{ projectPath }}</div>
      <div class="home-project-tile__title home-tile__title text-grey-1">{{ title }}</div>
      <div class="home-project-tile__subtitle home-tile__subtitle text-grey-3 q-mt-xs">{{ subtitle }}</div>
    </div>
  </q-card>
</template>

<script setup>
const emit = defineEmits(['select'])

defineProps({
  projectPath: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  backgroundImage: {
    type: String,
    required: true
  },
  transitionName: {
    type: String,
    default: ''
  },
  ariaLabel: {
    type: String,
    default: ''
  }
})

function emitSelect () {
  emit('select')
}
</script>

<style scoped lang="scss">
@use '../../css/home-tile-foundation' as tile;

.home-project-tile {
  @include tile.tile-surface(clamp(280px, 34vh, 420px), cover);
  width: 100%;
  cursor: pointer;
  text-align: left;
  pointer-events: auto;

  &:hover .home-project-tile__content,
  &:focus-visible .home-project-tile__content {
    transform: translateY(-2px);
    text-shadow: 0 10px 24px rgba($dark-page, 0.42);
  }

  &:focus-visible {
    outline: 2px solid rgba($grey-1, 0.95);
    outline-offset: -6px;
  }

  &::after {
    @include tile.tile-overlay(linear-gradient(180deg, rgba($dark-page, 0) 34%, rgba($dark-page, 0.7) 100%));
  }

  &__content {
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1), text-shadow 0.24s ease;
  }

  &__meta {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
  }

  &__title {
    font-size: clamp(1.25rem, 1.6vw, 1.75rem);
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  &__subtitle {
    max-width: 26rem;
    font-size: 0.98rem;
    line-height: 1.4;
  }

  @media (max-width: 680px) {
    min-height: 240px;
  }
}
</style>
