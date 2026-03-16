<template>
  <q-page class="project-detail-page q-pa-md q-pb-xl">
    <div v-if="project" class="project-detail">
      <div class="project-detail__layout">
        <aside class="project-detail__sidebar">
          <q-card
            flat
            square
            class="project-detail__poster relative-position"
            :style="{ backgroundImage: project.backgroundImage, 'view-transition-name': project.transitionName }"
          >
            <q-btn
              flat
              round
              dense
              icon="arrow_back"
              aria-label="Go back"
              class="project-detail__back-btn absolute-top-left bg-dark"
              text-color="grey-1"
              @click="goBack"
            />

            <div class="project-detail__poster-overlay absolute-full" aria-hidden="true" />

            <div class="project-detail__poster-copy absolute-bottom text-grey-1 q-pa-lg">
              <div class="project-detail__poster-label text-uppercase text-grey-4">{{ project.projectPath }}</div>
              <div class="project-detail__poster-title text-grey-1 q-mt-sm">{{ project.title }}</div>
            </div>
          </q-card>

          <q-btn
            class="project-detail__github-btn"
            outline
            no-caps
            color="dark"
            icon-right="open_in_new"
            label="Open on GitHub"
            :href="project.githubUrl"
            target="_blank"
            rel="noreferrer"
          />

          <div class="project-detail__pill-row project-detail__pill-row--sidebar q-mt-xs">
            <q-chip
              clickable
              square
              outline
              color="grey-8"
              text-color="grey-9"
              class="project-detail__tag-chip"
              @click="openLabel(project.primaryLanguage)"
            >
              {{ project.primaryLanguage }}
            </q-chip>
            <q-chip
              v-for="tag in project.tags"
              :key="tag"
              clickable
              square
              outline
              color="grey-8"
              text-color="grey-9"
              class="project-detail__tag-chip"
              @click="openLabel(tag)"
            >
              {{ tag }}
            </q-chip>
          </div>
        </aside>

        <section class="project-detail__body text-dark">
          <p class="project-detail__subtitle text-grey-8 q-ma-none">{{ project.subtitle }}</p>

          <p class="project-detail__description text-dark q-ma-none">{{ project.description }}</p>
          <p v-for="paragraph in project.storyline" :key="paragraph" class="project-detail__paragraph text-grey-8 q-ma-none q-mt-md">
            {{ paragraph }}
          </p>
        </section>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeta } from 'quasar'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'
import { goBack as performGoBack } from 'src/utils/navigation'

const route = useRoute()
const router = useRouter()
const githubProjectsStore = useGitHubProjectsStore()

const project = computed(() => githubProjectsStore.projectByRoute(route.params.owner, route.params.repo))

useMeta(() => {
  if (!project.value) {
    return {
      title: 'Project Not Found | Interview Challenge Archive'
    }
  }

  return {
    title: `${project.value.title} | Interview Challenge Archive`,
    meta: {
      description: { name: 'description', content: project.value.subtitle || project.value.description },
      ogTitle: { property: 'og:title', content: project.value.title },
      ogDescription: { property: 'og:description', content: project.value.subtitle || project.value.description }
    }
  }
})

// Check if project exists and redirect to 404 if not
async function checkProjectAndRedirect () {
  // Ensure store is loaded
  await githubProjectsStore.ensureItemsLoaded()

  if (!project.value) {
    router.replace({ name: 'not-found', query: { path: route.fullPath } })
  }
}

// Check on mount and when route changes
onMounted(() => {
  checkProjectAndRedirect()
})

watch(
  () => route.fullPath,
  () => {
    checkProjectAndRedirect()
  }
)

async function goBack () {
  await performGoBack(router)
}

async function openLabel (label) {
  await router.push({
    name: 'home',
    query: {
      label
    }
  })
}
</script>

<style scoped lang="scss">
.project-detail-page {
  @media (max-width: 900px) {
  }

  @media (max-width: 640px) {
  }
}

.project-detail {
  &__layout {
    display: grid;
    grid-template-columns: minmax(280px, 420px) minmax(0, 1fr);
    gap: 32px;
    align-items: start;

    @media (max-width: 900px) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  &__sidebar {
    display: grid;
    gap: 22px;
    align-self: start;
    position: sticky;
    top: 24px;

    @media (max-width: 900px) {
      position: relative;
      top: 0;
    }
  }

  &__poster {
    min-height: clamp(340px, 56vh, 560px);
    overflow: hidden;
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    border: 1px solid rgba($grey-1, 0.42);
    box-shadow: 0 28px 60px rgba($dark-page, 0.16);
    animation: project-poster-settle 0.62s cubic-bezier(0.22, 1, 0.36, 1);

    @media (max-width: 900px) {
      min-height: 320px;
    }

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &__poster-overlay {
    z-index: 0;
    pointer-events: none;
    background: linear-gradient(180deg, rgba($dark-page, 0.08) 0%, rgba($dark-page, 0.78) 100%);
  }

  &__back-btn {
    top: 16px;
    left: 16px;
    z-index: 2;
    border: 1px solid rgba($grey-1, 0.22);
    backdrop-filter: blur(12px) saturate(1.08);
    -webkit-backdrop-filter: blur(12px) saturate(1.08);
  }

  &__poster-copy {
    z-index: 1;
  }

  &__poster-label,
  &__eyebrow {
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.18em;
  }

  &__poster-title {
    font-size: clamp(1.7rem, 2.8vw, 2.6rem);
    font-weight: 700;
    line-height: 1.02;
    letter-spacing: -0.03em;
  }

  &__body {
    max-width: 860px;
  }

  &__github-btn {
    justify-self: stretch;
    min-height: 52px;
  }

  &__subtitle {
    max-width: 54rem;
    font-size: clamp(1.1rem, 1.8vw, 1.45rem);
    line-height: 1.45;
  }

  &__pill-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__description,
  &__paragraph {
    max-width: 52rem;
    font-size: clamp(1.08rem, 1.5vw, 1.24rem);
    line-height: 1.75;
  }

  &__tag-chip {
    cursor: pointer;
  }
}

@keyframes project-poster-settle {
  from {
    opacity: 0;
    transform: translate3d(48px, 0, 0) scale(0.96);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}
</style>
