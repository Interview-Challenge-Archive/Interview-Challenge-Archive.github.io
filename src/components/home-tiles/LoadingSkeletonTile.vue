<template>
  <q-card
    flat
    square
    class="loading-skeleton-tile"
    :style="{ '--tile-background': backgroundImage, backgroundImage }"
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
defineProps({
  backgroundImage: {
    type: String,
    required: true
  }
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
