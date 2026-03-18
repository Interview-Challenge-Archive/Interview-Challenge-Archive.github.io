<template>
  <div class="about-dock-panel">
    <div class="text-h5 text-uppercase q-mb-sm">{{ t('dock.about.title') }}</div>
    <div class="row q-col-gutter-lg items-start">
      <div class="col-12 col-md about-dock-panel__content-col">
        <component
          v-for="container in descriptionContainers"
          :key="container.key"
          :is="container.component"
          :class="container.class"
        >
          <div class="about-dock-panel__description text-body2 text-grey-8">
            <p
              v-for="(paragraph, paragraphIndex) in descriptionParagraphs"
              :key="`${container.key}-${paragraphIndex}`"
              class="q-mb-md"
            >
              <template v-for="(token, tokenIndex) in paragraph.tokens" :key="`${container.key}-${paragraphIndex}-${tokenIndex}`">
                <template v-if="token.type === 'text'">
                  {{ token.value }}
                </template>
                <template v-else-if="token.type === 'aiTools'">
                  <template v-for="(tool, toolIndex) in aiTools" :key="`${container.key}-${tool.name}`">
                    <a
                      class="about-dock-panel__tool-link text-dark"
                      :href="tool.url"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {{ tool.name }}
                    </a>
                    <span v-if="toolIndex < aiTools.length - 1">, </span>
                  </template>
                </template>
                <template v-else-if="token.type === 'social'">
                  <a
                    class="about-dock-panel__tool-link text-dark"
                    :href="resolveSocialLink(token.value)?.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    v-if="resolveSocialLink(token.value)?.url"
                  >
                    {{ resolveSocialLink(token.value).label }}
                  </a>
                  <template v-else>
                    {{ token.value === 'github' ? 'GitHub' : 'LinkedIn' }}
                  </template>
                </template>
                <template v-else-if="token.type === 'primaryAuthor'">
                  <a
                    v-if="primaryAuthor.profileUrl"
                    class="about-dock-panel__author-link text-dark"
                    :href="primaryAuthor.profileUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ primaryAuthor.displayName }}
                  </a>
                  <template v-else>
                    {{ primaryAuthor.displayName }}
                  </template>
                </template>
                <template v-else-if="token.type === 'multiverse'">
                  <a
                    class="about-dock-panel__tool-link text-dark"
                    :href="multiverseLink.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    v-if="multiverseLink?.url"
                  >
                    {{ multiverseLink.label || 'Multiverse theme by HTML5 UP' }}
                  </a>
                  <template v-else>
                    Multiverse theme by HTML5 UP
                  </template>
                </template>
              </template>
            </p>
          </div>
        </component>
      </div>

      <aside class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <div class="text-subtitle2 text-uppercase text-grey-8 q-mb-sm">{{ t('dock.about.sections.socialNetworks') }}</div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="socialLink in socialLinks"
            :key="socialLink.id"
            flat
            round
            dense
            color="dark"
            :icon="socialLink.icon"
            :aria-label="socialLink.label"
            :href="socialLink.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <q-tooltip>{{ socialLink.label }}</q-tooltip>
          </q-btn>
        </div>
      </aside>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { QScrollArea } from 'quasar'
import { useI18n } from 'vue-i18n'
import aboutConfig from 'src/config/about.yml'
import packageInfo from '../../../package.json'

const { t } = useI18n()
const aiToolsPlaceholder = '__AI_TOOLS__'
const githubPlaceholder = '__GITHUB__'
const linkedinPlaceholder = '__LINKEDIN__'
const primaryAuthorPlaceholder = '__PRIMARY_AUTHOR__'
const multiversePlaceholder = '__MULTIVERSE__'
const placeholderPattern = /(__AI_TOOLS__|__GITHUB__|__LINKEDIN__|__PRIMARY_AUTHOR__|__MULTIVERSE__)/
const descriptionContainers = [
  {
    key: 'desktop',
    component: QScrollArea,
    class: 'about-dock-panel__description-container about-dock-panel__scroll-area full-width gt-xs'
  },
  {
    key: 'mobile',
    component: 'div',
    class: 'about-dock-panel__description-container full-width lt-sm'
  }
]

const socialLinks = computed(() => Object.values(aboutConfig.about.socialLinks ?? {}))
const multiverseLink = aboutConfig.about.referenceLinks?.multiverse ?? {}
const socialLinkMap = computed(() =>
  socialLinks.value.reduce((result, socialLink) => {
    result[socialLink.id] = socialLink
    return result
  }, {})
)
const primaryAuthor = normalizeAuthor(packageInfo.author)
const aiTools = computed(() =>
  Object.entries(packageInfo.aiTools ?? {})
    .map(([name, details]) => ({
      name,
      url: details?.url ?? ''
    }))
    .filter((tool) => tool.url)
)
const descriptionParagraphs = computed(() =>
  t('dock.about.description', {
    aiTools: aiToolsPlaceholder,
    github: githubPlaceholder,
    linkedin: linkedinPlaceholder,
    primaryAuthor: primaryAuthorPlaceholder,
    multiverse: multiversePlaceholder
  })
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      tokens: paragraph.split(placeholderPattern).map((token) => {
        if (token === aiToolsPlaceholder) {
          return { type: 'aiTools', value: token }
        }

        if (token === githubPlaceholder) {
          return { type: 'social', value: 'github' }
        }

        if (token === linkedinPlaceholder) {
          return { type: 'social', value: 'linkedin' }
        }

        if (token === primaryAuthorPlaceholder) {
          return { type: 'primaryAuthor', value: token }
        }

        if (token === multiversePlaceholder) {
          return { type: 'multiverse', value: token }
        }

        return { type: 'text', value: token }
      })
    }))
)

function resolveSocialLink (socialId) {
  return socialLinkMap.value[socialId] ?? null
}

function normalizeAuthor (author) {
  if (author && typeof author === 'object' && !Array.isArray(author)) {
    return normalizeObjectAuthor(author)
  }

  const rawAuthor = String(author ?? '').trim()

  if (!rawAuthor) {
    return {
      raw: '',
      displayName: '',
      profileUrl: ''
    }
  }

  const withoutEmail = rawAuthor.replace(/\s*<[^>]*>/g, '').trim()
  const displayName = withoutEmail.replace(/\s*\(aka\s+[^)]+\)/i, '').trim()

  return {
    raw: rawAuthor,
    displayName,
    profileUrl: ''
  }
}

function normalizeObjectAuthor (author) {
  const rawAuthor = JSON.stringify(author)
  const name = String(author.name ?? '').trim()
  const displayName = name.replace(/\s*\(aka\s+[^)]+\)/i, '').trim()

  return {
    raw: rawAuthor,
    displayName,
    profileUrl: String(author.url ?? '').trim()
  }
}
</script>

<style scoped lang="scss">
.about-dock-panel {
  &__scroll-area {
    height: min(20rem, max(0px, calc(50dvh - 142px)));
  }

  &__description {
    p:last-child {
      margin-bottom: 0;
    }
  }

  &__tool-link,
  &__author-link {
    text-underline-offset: 3px;
  }
}
</style>
