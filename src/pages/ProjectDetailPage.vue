<template>
  <q-page class="project-detail-page">
    <div v-if="project" class="project-detail">
      <div class="project-detail__layout">
        <aside class="project-detail__sidebar">
          <div
            class="project-detail__poster"
            :style="{ backgroundImage: project.backgroundImage, 'view-transition-name': project.transitionName }"
          >
            <q-btn
              flat
              round
              dense
              icon="arrow_back"
              aria-label="Go back"
              class="project-detail__back-btn"
              @click="goBack"
            />

            <div class="project-detail__poster-copy">
              <div class="project-detail__poster-label text-uppercase">{{ project.projectPath }}</div>
              <div class="project-detail__poster-title">{{ project.title }}</div>
            </div>
          </div>

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

          <div class="project-detail__pill-row project-detail__pill-row--sidebar">
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

        <section class="project-detail__body">
          <p class="project-detail__subtitle">{{ project.subtitle }}</p>

          <p class="project-detail__description">{{ project.description }}</p>
          <p v-for="paragraph in project.storyline" :key="paragraph" class="project-detail__paragraph">
            {{ paragraph }}
          </p>
        </section>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGitHubProjectsStore } from 'src/stores/github-projects-store'

const route = useRoute()
const router = useRouter()
const githubProjectsStore = useGitHubProjectsStore()

const project = computed(() => githubProjectsStore.projectByRoute(route.params.owner, route.params.repo))

// Redirect to 404 page if project not found
watch(
  project,
  (newProject) => {
    if (!newProject) {
      router.replace({ path: '/not-found' })
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.project-detail-page {
  padding: 24px 20px 112px;
}

.project-detail__layout {
  display: grid;
  grid-template-columns: minmax(280px, 420px) minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.project-detail__sidebar {
  display: grid;
  gap: 22px;
  align-self: start;
  position: sticky;
  top: 24px;
}

.project-detail__poster {
  display: flex;
  align-items: flex-end;
  min-height: clamp(340px, 56vh, 560px);
  overflow: hidden;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  border: 1px solid rgba($grey-1, 0.42);
  box-shadow: 0 28px 60px rgba($dark-page, 0.16);
  animation: project-poster-settle 0.62s cubic-bezier(0.22, 1, 0.36, 1);
}

.project-detail__back-btn {
  top: 16px;
  left: 16px;
  z-index: 2;
  color: $grey-1;
  background: rgba($dark-page, 0.34);
  border: 1px solid rgba($grey-1, 0.22);
  backdrop-filter: blur(12px) saturate(1.08);
  -webkit-backdrop-filter: blur(12px) saturate(1.08);
}

.project-detail__poster::after {
  content: '';
  inset: 0;
  background: linear-gradient(180deg, rgba($dark-page, 0.08) 0%, rgba($dark-page, 0.78) 100%);
}

.project-detail__poster-copy {
  z-index: 1;
  padding: 24px;
  color: $grey-1;
}

.project-detail__poster-label,
.project-detail__eyebrow {
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.18em;
}

.project-detail__poster-label {
  color: rgba($grey-1, 0.72);
}

.project-detail__poster-title {
  margin-top: 10px;
  font-size: clamp(1.7rem, 2.8vw, 2.6rem);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.03em;
}

.project-detail__body {
  max-width: 860px;
}

.project-detail__github-btn {
  justify-self: stretch;
  min-height: 52px;
}

.project-detail__eyebrow {
  color: rgba($dark-page, 0.48);
}

.project-detail__subtitle {
  max-width: 54rem;
  margin: 0;
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  line-height: 1.45;
  color: rgba($dark-page, 0.72);
}

.project-detail__pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.project-detail__pill-row--sidebar {
  margin-top: 2px;
}

.project-detail__description,
.project-detail__paragraph {
  max-width: 52rem;
  margin: 0;
  font-size: clamp(1.08rem, 1.5vw, 1.24rem);
  line-height: 1.75;
  color: rgba($dark-page, 0.9);
}

.project-detail__tag-chip {
  cursor: pointer;
}

.project-detail__paragraph {
  margin-top: 18px;
  color: rgba($dark-page, 0.76);
}

.project-detail__missing {
  display: flex;
  justify-content: flex-start;
}

.project-detail__missing-card {
  width: min(100%, 720px);
  background: rgba($grey-1, 0.82);
  border-color: rgba($dark-page, 0.08);
  box-shadow: 0 14px 40px rgba($dark-page, 0.05);
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

@media (max-width: 900px) {
  .project-detail-page {
    padding-inline: 16px;
  }

  .project-detail__layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .project-detail__sidebar {
    position: relative;
    top: 0;
  }

  .project-detail__poster {
    min-height: 320px;
  }
}

@media (max-width: 640px) {
  .project-detail-page {
    padding-bottom: 96px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-detail__poster {
    animation: none;
  }
}
</style>
