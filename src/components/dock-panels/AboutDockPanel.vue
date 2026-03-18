<template>
  <div class="about-dock-panel">
    <div class="text-h5 text-uppercase q-mb-sm">{{ t('dock.about.title') }}</div>
    <div class="about-dock-panel__layout">
      <div class="about-dock-panel__description text-body2 text-grey-8">
        <p
          v-for="(paragraph, paragraphIndex) in descriptionParagraphs"
          :key="paragraphIndex"
          class="q-mb-md"
        >
          <template v-for="(token, tokenIndex) in paragraph.tokens" :key="`${paragraphIndex}-${tokenIndex}`">
            <template v-if="token.type === 'text'">
              {{ token.value }}
            </template>
            <template v-else-if="token.type === 'aiTools'">
              <template v-for="(tool, toolIndex) in aiTools" :key="tool.name">
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
                {{ primaryAuthor.mention }}
              </a>
              <template v-else>
                {{ primaryAuthor.mention }}
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
                {{ multiverseLink.label }}
              </a>
              <template v-else>
                Multiverse theme by HTML5 UP
              </template>
            </template>
          </template>
        </p>
      </div>

      <aside class="about-dock-panel__side">
        <div class="text-subtitle2 text-uppercase text-grey-8 q-mb-sm">{{ t('dock.about.sections.socialNetworks') }}</div>
        <div class="about-dock-panel__social-links">
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

const socialLinks = computed(() => Object.values(aboutConfig.about.socialLinks ?? {}))
const multiverseLink = computed(() => ({
  label: aboutConfig.about.referenceLinks?.multiverse?.label ?? 'Multiverse theme by HTML5 UP',
  url: aboutConfig.about.referenceLinks?.multiverse?.url ?? ''
}))
const socialLinkMap = computed(() =>
  socialLinks.value.reduce((result, socialLink) => {
    result[socialLink.id] = socialLink
    return result
  }, {})
)
const authors = computed(() => {
  if (Array.isArray(packageInfo.authors) && packageInfo.authors.length > 0) {
    return packageInfo.authors
  }

  return packageInfo.author ? [packageInfo.author] : []
})
const authorEntries = computed(() => authors.value.map((author) => normalizeAuthor(author)))
const primaryAuthor = computed(() => authorEntries.value[0] ?? {
  raw: '',
  mention: '',
  displayName: '',
  profileUrl: ''
})
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
      mention: '',
      displayName: '',
      profileUrl: ''
    }
  }

  const aliasMatch = rawAuthor.match(/\(aka\s+([^)]+)\)/i)
  const alias = aliasMatch?.[1]?.trim() ?? ''
  const withoutEmail = rawAuthor.replace(/\s*<[^>]*>/g, '').trim()
  const displayName = withoutEmail.replace(/\s*\(aka\s+[^)]+\)/i, '').trim()
  const mention = alias ? `@${alias}` : displayName
  const profileUrl = resolveAuthorProfileUrl({
    alias,
    explicitUrl: ''
  })

  return {
    raw: rawAuthor,
    mention,
    displayName,
    profileUrl
  }
}

function normalizeObjectAuthor (author) {
  const rawAuthor = JSON.stringify(author)
  const name = String(author.name ?? '').trim()
  const aliasMatch = name.match(/\(aka\s+([^)]+)\)/i)
  const alias = aliasMatch?.[1]?.trim() ?? ''
  const displayName = name.replace(/\s*\(aka\s+[^)]+\)/i, '').trim()
  const mentionFromUrl = deriveGithubMentionFromUrl(author.url)
  const mention = alias ? `@${alias}` : (mentionFromUrl || displayName || name)
  const profileUrl = resolveAuthorProfileUrl({
    alias,
    explicitUrl: String(author.url ?? '').trim()
  })

  return {
    raw: rawAuthor,
    mention,
    displayName,
    profileUrl
  }
}

function resolveAuthorProfileUrl ({ alias, explicitUrl }) {
  if (explicitUrl) {
    return explicitUrl
  }

  if (alias) {
    return `https://github.com/${alias}`
  }

  return ''
}

function deriveGithubMentionFromUrl (url) {
  const rawUrl = String(url ?? '').trim()

  if (!rawUrl) {
    return ''
  }

  const githubProfileMatch = rawUrl.match(/^https?:\/\/(?:www\.)?github\.com\/([^/\s?#]+)\/?$/i)
  return githubProfileMatch?.[1] ? `@${githubProfileMatch[1]}` : ''
}
</script>

<style scoped lang="scss">
.about-dock-panel__layout {
  display: grid;
  gap: 20px;
}

.about-dock-panel__description p:last-child {
  margin-bottom: 0;
}

.about-dock-panel__side {
  min-width: 0;
}

.about-dock-panel__social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

@media (min-width: 860px) {
  .about-dock-panel__layout {
    align-items: start;
    column-gap: 28px;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .about-dock-panel__side {
    width: max-content;
  }
}

.about-dock-panel__tool-link {
  text-underline-offset: 3px;
}

.about-dock-panel__author-link {
  text-underline-offset: 3px;
}
</style>
