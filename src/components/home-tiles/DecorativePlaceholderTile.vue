<template>
  <q-card
    flat
    square
    class="decorative-placeholder-tile"
    :style="{ '--tile-background': backgroundImage, backgroundImage }"
    aria-hidden="true"
  />
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
