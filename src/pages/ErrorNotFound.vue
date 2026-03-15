<template>
  <section class="error-not-found">
    <div class="error-not-found__backdrop" aria-hidden="true" />
    <div class="error-not-found__wash" aria-hidden="true" />

    <div class="error-not-found__inner">
      <header class="error-not-found__header">
        <div class="error-not-found__brand text-subtitle1 text-weight-medium">
          <img src="favicon.svg" alt="" class="error-not-found__brand-icon" aria-hidden="true">
          <span>{{ t('app.title') }}</span>
        </div>
      </header>

      <q-card flat class="error-not-found__panel">
        <section class="error-not-found__copy">
          <p class="text-uppercase">{{ t('notfound.eyebrow') }}</p>
          <h1 class="text-h1">
            <span class="error-not-found__code">404</span>
          </h1>
          <p>{{ t('notfound.description') }}</p>

          <q-btn
            class="error-not-found__action"
            color="primary"
            unelevated
            to="/"
            :label="t('notfound.action')"
            no-caps
          />
        </section>

        <div class="error-not-found__visual" aria-hidden="true">
          <div class="error-not-found__preview">
            <LoadingSkeletonTile
              :background-image="featureTileBackground"
            />

            <div class="error-not-found__preview-grid">
              <component
                v-for="tile in previewTiles"
                :key="tile.id"
                :is="tile.component"
                :background-image="tile.backgroundImage"
                :style="previewTileStyle(tile)"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSkeletonTile from 'src/components/home-tiles/LoadingSkeletonTile.vue'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'ErrorNotFound'
})

const route = useRoute()
const { t } = useI18n()

// Restore original URL after component mounts
onMounted(() => {
  if (route.query.path) {
    window.history.replaceState({}, '', route.query.path)
  }
})

const featureTileBackground = [
  'radial-gradient(circle at 18% 18%, rgba(101, 194, 255, 0.84) 0%, rgba(101, 194, 255, 0) 40%)',
  'radial-gradient(circle at 80% 24%, rgba(184, 155, 255, 0.46) 0%, rgba(184, 155, 255, 0) 34%)',
  'linear-gradient(145deg, rgba(48, 61, 91, 0.34) 0%, rgba(20, 26, 40, 0.96) 100%)'
].join(', ')

const previewTiles = [
  {
    id: 'missing',
    component: LoadingSkeletonTile,
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
    id: 'searching',
    component: LoadingSkeletonTile,
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
    id: 'explore',
    component: LoadingSkeletonTile,
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
    id: 'return',
    component: LoadingSkeletonTile,
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

function previewTileStyle (tile) {
  return {
    '--tile-glow-start-x': tile.glowStartX,
    '--tile-glow-start-y': tile.glowStartY,
    '--tile-glow-x': tile.glowStartX,
    '--tile-glow-y': tile.glowStartY,
    '--tile-glow-end-x': tile.glowEndX,
    '--tile-glow-end-y': tile.glowEndY
  }
}
</script>

<style scoped lang="scss">
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

.error-not-found {
  overflow: hidden;
  min-height: 100vh;
  padding: clamp(20px, 4vw, 40px);
  background:
    radial-gradient(circle at top, rgba($grey-1, 0.92), rgba($grey-2, 0) 36%),
    linear-gradient(180deg, $grey-2 0%, $blue-grey-1 100%);

  &__backdrop,
  &__wash {
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
    gap: 12px;
    padding: clamp(24px, 4vw, 40px);
    border-right: 1px solid rgba($dark-page, 0.07);
    color: $dark-page;

    > p {
      margin: 0;
    }

    > p:first-child {
      font-size: 0.76rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      color: rgba($dark-page, 0.52);
    }

    > p:last-child {
      max-width: 28rem;
      font-size: clamp(1rem, 1.4vw, 1.1rem);
      line-height: 1.6;
      color: rgba($dark-page, 0.74);
    }

    .error-not-found__code {
      display: block;
      font-size: clamp(4rem, 12vw, 8rem);
      font-weight: 800;
      background: linear-gradient(135deg, $primary 0%, $accent 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      filter: drop-shadow(0 2px 8px rgba($primary, 0.24));
    }
  }

  &__action {
    align-self: start;
    min-width: 140px;
    padding: 10px 24px;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  &__visual {
    display: grid;
    align-items: center;
  }

  &__preview {
    display: grid;
    gap: 16px;
    padding: clamp(20px, 3vw, 28px);
    background: linear-gradient(180deg, rgba($grey-2, 0.14) 0%, rgba($blue-grey-1, 0.28) 100%);

    > :first-child,
    &-grid > * {
      border: 1px solid rgba($grey-1, 0.42);
      box-shadow: 0 24px 48px rgba($dark-page, 0.14);
    }

    > :first-child.loading-skeleton-tile {
      min-height: clamp(240px, 34vh, 360px);

      :deep(.loading-skeleton-tile__content) {
        animation: notfound-skeleton-drift 4.6s ease-in-out infinite;
      }
    }

    &-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;

      > * {
        animation: tile-background-scroll 24s ease-in-out infinite alternate;
      }

      > *.loading-skeleton-tile,
      > *.decorative-placeholder-tile {
        min-height: clamp(140px, 17vh, 176px);
      }

      :deep(.loading-skeleton-tile__content) {
        gap: 10px;
        padding: 16px;
        animation: notfound-skeleton-drift 4.2s ease-in-out infinite;
      }

      :deep(.loading-skeleton-tile__line--meta) {
        max-width: 92px;
      }

      :deep(.loading-skeleton-tile__line--title) {
        max-width: 148px;
        height: 18px;
      }

      :deep(.loading-skeleton-tile__line--subtitle) {
        max-width: 176px;
      }

      :deep(.loading-skeleton-tile__line--subtitle-short) {
        max-width: 124px;
      }

      > :nth-child(2) {
        animation-delay: -6s;

        :deep(.loading-skeleton-tile__content) {
          animation-delay: -0.8s;
        }
      }

      > :nth-child(3) {
        animation-delay: -12s;

        :deep(.loading-skeleton-tile__content) {
          animation-delay: -1.6s;
        }
      }

      > :nth-child(4) {
        animation-delay: -18s;

        :deep(.loading-skeleton-tile__content) {
          animation-delay: -2.4s;
        }
      }
    }

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

@keyframes notfound-skeleton-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0);
  }

  50% {
    transform: translate3d(0, -6px, 0);
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
  .error-not-found {
    &__panel {
      grid-template-columns: minmax(0, 1fr);
    }

    &__copy {
      border-right: 0;
      border-bottom: 1px solid rgba($dark-page, 0.07);
      align-content: start;
    }

    &__visual {
      align-items: start;
    }
  }
}

@media (max-width: 720px) {
  .error-not-found {
    &__header {
      min-height: auto;
    }

    &__preview {
      &-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .error-not-found {
    &__wash,
    &__panel,
    &__preview > :first-child,
    &__preview-grid > * {
      animation: none !important;
    }

    &__preview {
      :deep(.loading-skeleton-tile__content) {
        animation: none !important;
      }
    }
  }
}
</style>
