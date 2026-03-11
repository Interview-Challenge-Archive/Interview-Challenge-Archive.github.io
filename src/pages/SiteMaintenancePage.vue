<template>
  <section class="site-maintenance">
    <div class="site-maintenance__backdrop" aria-hidden="true" />
    <div class="site-maintenance__wash" aria-hidden="true" />

    <div class="site-maintenance__inner">
      <header class="site-maintenance__header">
        <div class="site-maintenance__brand text-subtitle1 text-weight-medium">
          <img src="favicon.svg" alt="" class="site-maintenance__brand-icon" aria-hidden="true">
          <span>{{ t('app.title') }}</span>
        </div>
      </header>

      <q-card flat class="site-maintenance__panel">
        <q-card-section class="site-maintenance__copy">
          <div class="site-maintenance__eyebrow">{{ t('maintenance.eyebrow') }}</div>
          <h1 class="site-maintenance__title">{{ t('maintenance.title') }}</h1>
          <p class="site-maintenance__description">{{ t('maintenance.description') }}</p>
        </q-card-section>

        <div class="site-maintenance__preview" aria-hidden="true">
          <article class="site-maintenance__preview-feature" :style="featureTileStyle">
            <div class="site-maintenance__preview-skeleton site-maintenance__preview-skeleton--feature">
              <span class="site-maintenance__preview-line site-maintenance__preview-line--short" />
              <span class="site-maintenance__preview-line site-maintenance__preview-line--hero" />
              <span class="site-maintenance__preview-line site-maintenance__preview-line--title" />
              <span class="site-maintenance__preview-line" />
              <span class="site-maintenance__preview-line site-maintenance__preview-line--medium" />
            </div>
          </article>

          <div class="site-maintenance__preview-grid">
            <article
              v-for="tile in previewTiles"
              :key="tile.id"
              class="site-maintenance__preview-tile"
              :style="{
                '--tile-background': tile.backgroundImage,
                '--tile-glow-start-x': tile.glowStartX,
                '--tile-glow-start-y': tile.glowStartY,
                '--tile-glow-x': tile.glowStartX,
                '--tile-glow-y': tile.glowStartY,
                '--tile-glow-end-x': tile.glowEndX,
                '--tile-glow-end-y': tile.glowEndY,
                backgroundImage: tile.backgroundImage
              }"
            >
              <div class="site-maintenance__preview-skeleton">
                <span class="site-maintenance__preview-line site-maintenance__preview-line--short" />
                <span class="site-maintenance__preview-line site-maintenance__preview-line--title" />
                <span class="site-maintenance__preview-line" />
              </div>
            </article>
          </div>
        </div>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'SiteMaintenancePage'
})

const { t } = useI18n()

const featureTileBackground = [
  'radial-gradient(circle at 18% 18%, rgba(101, 194, 255, 0.84) 0%, rgba(101, 194, 255, 0) 40%)',
  'radial-gradient(circle at 80% 24%, rgba(184, 155, 255, 0.46) 0%, rgba(184, 155, 255, 0) 34%)',
  'linear-gradient(145deg, rgba(48, 61, 91, 0.34) 0%, rgba(20, 26, 40, 0.96) 100%)'
].join(', ')

const featureTileStyle = {
  '--tile-background': featureTileBackground,
  backgroundImage: featureTileBackground
}

const previewTiles = [
  {
    id: 'curated',
    glowStartX: '24%',
    glowStartY: '26%',
    glowEndX: '58%',
    glowEndY: '44%',
    backgroundImage: [
      'radial-gradient(circle at var(--tile-glow-x) var(--tile-glow-y), rgba(255, 196, 110, 0.82) 0%, rgba(255, 196, 110, 0) 38%)',
      'linear-gradient(145deg, rgba(71, 56, 42, 0.3) 0%, rgba(26, 24, 28, 0.95) 100%)'
    ].join(', ')
  },
  {
    id: 'loading',
    glowStartX: '72%',
    glowStartY: '24%',
    glowEndX: '46%',
    glowEndY: '42%',
    backgroundImage: [
      'radial-gradient(circle at var(--tile-glow-x) var(--tile-glow-y), rgba(119, 186, 255, 0.78) 0%, rgba(119, 186, 255, 0) 36%)',
      'linear-gradient(155deg, rgba(39, 58, 86, 0.28) 0%, rgba(21, 28, 41, 0.96) 100%)'
    ].join(', ')
  },
  {
    id: 'search',
    glowStartX: '28%',
    glowStartY: '22%',
    glowEndX: '54%',
    glowEndY: '52%',
    backgroundImage: [
      'radial-gradient(circle at var(--tile-glow-x) var(--tile-glow-y), rgba(146, 212, 176, 0.76) 0%, rgba(146, 212, 176, 0) 36%)',
      'linear-gradient(155deg, rgba(42, 64, 57, 0.28) 0%, rgba(23, 27, 32, 0.96) 100%)'
    ].join(', ')
  },
  {
    id: 'updating',
    glowStartX: '78%',
    glowStartY: '26%',
    glowEndX: '48%',
    glowEndY: '46%',
    backgroundImage: [
      'radial-gradient(circle at var(--tile-glow-x) var(--tile-glow-y), rgba(201, 164, 255, 0.7) 0%, rgba(201, 164, 255, 0) 34%)',
      'linear-gradient(155deg, rgba(66, 55, 93, 0.28) 0%, rgba(24, 24, 35, 0.96) 100%)'
    ].join(', ')
  }
]
</script>

<style scoped lang="scss">
@use '../css/home-tile-foundation' as tile;

@property --tile-glow-x {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 50%;
}

@property --tile-glow-y {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 50%;
}

.site-maintenance {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  padding: clamp(20px, 4vw, 40px);
  background:
    radial-gradient(circle at top, rgba($grey-1, 0.92), rgba($grey-2, 0) 36%),
    linear-gradient(180deg, $grey-2 0%, $blue-grey-1 100%);

  &__backdrop,
  &__wash {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &__backdrop {
    opacity: 0.3;
    background:
      linear-gradient(90deg, rgba($grey-1, 0.04) 1px, transparent 1px),
      linear-gradient(rgba($grey-1, 0.04) 1px, transparent 1px);
    background-size: 120px 120px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.65), transparent 90%);
  }

  &__wash {
    background:
      radial-gradient(circle at 12% 16%, rgba($grey-1, 0.42), rgba($grey-1, 0) 30%),
      radial-gradient(circle at 88% 14%, rgba($primary, 0.12), rgba($primary, 0) 26%),
      radial-gradient(circle at 72% 78%, rgba($accent, 0.08), rgba($accent, 0) 24%);
    animation: backdrop-drift 12s ease-in-out infinite;
  }

  &__inner {
    position: relative;
    z-index: 1;
    width: min(1180px, 100%);
    margin: 0 auto;
    display: grid;
    gap: 18px;
  }

  &__header {
    display: flex;
    align-items: center;
    min-height: 28px;
  }

  &__brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: rgba($dark-page, 0.88);
    letter-spacing: -0.01em;

    &-icon {
      width: 20px;
      height: 20px;
      flex: 0 0 auto;
      border-radius: 6px;
    }
  }

  &__panel {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
    overflow: hidden;
    border: 1px solid rgba($dark-page, 0.08);
    background: linear-gradient(180deg, rgba($grey-1, 0.64) 0%, rgba($grey-1, 0.84) 100%);
    box-shadow: 0 24px 64px rgba($dark-page, 0.08);
    backdrop-filter: blur(18px) saturate(1.04);
    animation: panel-settle 640ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  &__copy {
    display: grid;
    align-content: start;
    gap: 24px;
    padding: clamp(28px, 5vw, 56px);
    border-right: 1px solid rgba($dark-page, 0.07);
    color: $dark-page;
  }

  &__eyebrow {
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }

  &__eyebrow {
    color: rgba($dark-page, 0.52);
  }

  &__title {
    margin: 0;
    max-width: 11ch;
    font-size: clamp(2.3rem, 6vw, 4.6rem);
    line-height: 0.96;
    letter-spacing: -0.05em;
  }

  &__description {
    max-width: 40rem;
    margin: 0;
    font-size: clamp(1.02rem, 1.6vw, 1.16rem);
    line-height: 1.72;
    color: rgba($dark-page, 0.74);
  }

  &__preview {
    display: grid;
    gap: 16px;
    padding: clamp(20px, 3vw, 28px);
    background: linear-gradient(180deg, rgba($grey-2, 0.14) 0%, rgba($blue-grey-1, 0.28) 100%);

    &-feature,
    &-tile {
      border: 1px solid rgba($grey-1, 0.42);
      box-shadow: 0 24px 48px rgba($dark-page, 0.14);
    }

    &-feature {
      @include tile.tile-surface(clamp(240px, 34vh, 360px));

      &::before {
        @include tile.tile-blurred-background(
          -18px,
          cover,
          blur(28px) saturate(1.14),
          scale(1.05)
        );
      }

      &::after {
        @include tile.tile-overlay(
          (
            linear-gradient(135deg, rgba($grey-1, 0.12) 0%, rgba($grey-1, 0) 40%),
            repeating-linear-gradient(
              -45deg,
              rgba($grey-1, 0.06) 0 15px,
              rgba($grey-1, 0) 15px 30px
            ),
            linear-gradient(180deg, rgba($dark-page, 0.04) 0%, rgba($dark-page, 0.76) 100%)
          )
        );
      }
    }

    &-skeleton {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 1;
      padding: 18px 20px;
    }

    &-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    &-tile {
      @include tile.tile-surface(clamp(140px, 17vh, 176px));
      animation: tile-background-scroll 24s ease-in-out infinite alternate;

      &::before {
        @include tile.tile-blurred-background(
          -20px,
          cover,
          blur(30px) saturate(1.12),
          scale(1.08)
        );
      }

      &::after {
        @include tile.tile-overlay(
          linear-gradient(180deg, rgba($dark-page, 0.02) 0%, rgba($dark-page, 0.72) 100%)
        );
      }

      &:nth-child(2) {
        animation-delay: -6s;
      }

      &:nth-child(3) {
        animation-delay: -12s;
      }

      &:nth-child(4) {
        animation-delay: -18s;
      }
    }

    &-skeleton {
      display: grid;
      gap: 10px;
      align-content: end;

      &--feature {
        gap: 12px;
        padding: 22px 24px;
      }
    }

    &-line {
      display: block;
      height: 10px;
      border-radius: 999px;
      background: linear-gradient(
        90deg,
        rgba($grey-1, 0.16),
        rgba($grey-1, 0.34),
        rgba($grey-1, 0.16)
      );
      background-size: 220% 100%;
      animation: shimmer 2.8s linear infinite;

      &--short {
        width: 34%;
      }

      &--title {
        width: 72%;
        height: 16px;
      }

      &--hero {
        width: 58%;
        height: 26px;
      }

      &--medium {
        width: 64%;
      }
    }
  }
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }

  to {
    background-position: -20% 0;
  }
}

@keyframes panel-settle {
  from {
    opacity: 0;
    transform: translate3d(0, 18px, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes tile-background-scroll {
  from {
    --tile-glow-x: var(--tile-glow-start-x, 28%);
    --tile-glow-y: var(--tile-glow-start-y, 24%);
  }

  to {
    --tile-glow-x: var(--tile-glow-end-x, 62%);
    --tile-glow-y: var(--tile-glow-end-y, 48%);
  }
}

@keyframes backdrop-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -10px, 0);
  }
}

@media (max-width: 980px) {
  .site-maintenance {
    &__panel {
      grid-template-columns: minmax(0, 1fr);
    }

    &__copy {
      border-right: 0;
      border-bottom: 1px solid rgba($dark-page, 0.07);
    }
  }
}

@media (max-width: 720px) {
  .site-maintenance {
    &__header {
      min-height: auto;
    }

    &__preview {
      &-grid {
        grid-template-columns: 1fr;
      }

      &-feature-copy,
      &-tile-copy,
      &-skeleton {
        padding: 16px;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-maintenance {
    &__wash,
    &__panel,
    &__preview-feature,
    &__preview-tile,
    &__preview-line {
      animation: none !important;
    }
  }
}
</style>
