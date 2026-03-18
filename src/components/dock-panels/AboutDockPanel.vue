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
          <QMarkdown
            class="about-dock-panel__description text-body2 text-grey-8"
            :src="descriptionMarkdown"
            no-html
            no-heading-anchor-links
          />
        </component>
      </div>

      <aside class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <div class="text-subtitle2 text-uppercase text-grey-8 q-mb-sm">{{ t('dock.about.sections.socialNetworks') }}</div>
        <SocialNetworkLinks :social-links="socialLinks" />
        <OrganizationTopContributorsControl class="q-mt-lg" :organization="githubOrganization" />
      </aside>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { QScrollArea } from 'quasar'
import { useI18n } from 'vue-i18n'
import { QMarkdown } from '@quasar/quasar-ui-qmarkdown'
import '@quasar/quasar-ui-qmarkdown/dist/index.css'
import aboutConfig from 'src/config/about.yml'
import SocialNetworkLinks from 'src/components/internal/SocialNetworkLinks.vue'
import OrganizationTopContributorsControl from 'src/components/internal/OrganizationTopContributorsControl.vue'
import packageInfo from '../../../package.json'

const { t } = useI18n()
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
const githubOrganization = computed(() => extractOrganizationFromGitHubUrl(aboutConfig.about.socialLinks?.github?.url))
const descriptionLinks = aboutConfig.about.descriptionLinks ?? {}
const githubDescriptionLink = descriptionLinks.github ?? {}
const linkedinDescriptionLink = descriptionLinks.linkedin ?? {}
const multiverseLink = aboutConfig.about.referenceLinks?.multiverse ?? {}
const primaryAuthor = normalizeAuthor(packageInfo.author)
const aiTools = computed(() =>
  Object.entries(packageInfo.aiTools ?? {})
    .map(([name, details]) => ({
      name,
      url: details?.url ?? ''
    }))
    .filter((tool) => tool.url)
)
const descriptionMarkdown = computed(() =>
  t('dock.about.description', {
    aiTools: aiToolsMarkdown.value,
    github: linkOrText(githubDescriptionLink.label || 'GitHub', githubDescriptionLink.url),
    githubUrl: normalizeHttpUrl(githubDescriptionLink.url),
    linkedin: linkOrText(linkedinDescriptionLink.label || 'LinkedIn', linkedinDescriptionLink.url),
    linkedinUrl: normalizeHttpUrl(linkedinDescriptionLink.url),
    primaryAuthor: linkOrText(primaryAuthor.displayName, primaryAuthor.profileUrl),
    multiverse: linkOrText(multiverseLink.label || 'Multiverse theme by HTML5 UP', multiverseLink.url),
    multiverseLabel: multiverseLink.label || 'Multiverse theme by HTML5 UP',
    multiverseUrl: normalizeHttpUrl(multiverseLink.url)
  })
)
const aiToolsMarkdown = computed(() =>
  aiTools.value
    .map((tool) => linkOrText(tool.name, tool.url))
    .filter(Boolean)
    .join(', ')
)

function linkOrText (label, url) {
  const normalizedLabel = String(label ?? '').trim()
  const normalizedUrl = normalizeHttpUrl(url)

  if (!normalizedLabel) {
    return ''
  }

  if (!normalizedUrl) {
    return normalizedLabel
  }

  return `[${normalizedLabel}](${normalizedUrl})`
}

function normalizeHttpUrl (value) {
  const rawValue = String(value ?? '').trim()

  if (!rawValue) {
    return ''
  }

  try {
    const url = new URL(rawValue)

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return ''
    }

    return url.toString()
  } catch {
    return ''
  }
}

function extractOrganizationFromGitHubUrl (value) {
  const match = String(value ?? '').trim().match(/^https?:\/\/github\.com\/([^/?#]+)/i)

  return match?.[1] ?? ''
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
    :deep(p:last-child) {
      margin-bottom: 0;
    }

    :deep(p) {
      margin-bottom: 1rem;
    }

    :deep(.q-markdown--link) {
      color: inherit;
    }
  }

  :deep(.q-markdown--link) {
    text-underline-offset: 3px;
  }
}
</style>
