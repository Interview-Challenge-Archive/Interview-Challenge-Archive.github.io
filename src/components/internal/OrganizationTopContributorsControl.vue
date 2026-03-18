<template>
  <div>
    <div class="text-subtitle2 text-uppercase text-grey-8 q-mb-sm">{{ t('dock.about.sections.topContributors') }}</div>

    <div v-if="showLoading" class="row items-center q-gutter-sm">
      <q-spinner-dots color="dark" size="26px" />
      <div class="text-caption text-grey-7">{{ t('dock.about.contributors.loading') }}</div>
    </div>

    <div v-else-if="contributors.length" class="row items-center q-gutter-xs">
      <q-btn
        v-for="contributor in contributors"
        :key="contributor.login"
        flat
        round
        dense
        :href="contributor.profileUrl"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="contributor.login"
      >
        <q-avatar size="28px">
          <img :src="contributor.avatarUrl" :alt="contributor.login">
        </q-avatar>
        <q-tooltip>{{ contributor.login }} - {{ contributor.contributions }}</q-tooltip>
      </q-btn>
    </div>

    <div v-else class="text-caption" :class="statusClass">{{ statusMessage }}</div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useProjectOrganizationContributorsStore } from 'src/stores/project-organization-contributors-store'

const props = defineProps({
  organization: {
    type: String,
    default: ''
  }
})

const { t } = useI18n()
const projectOrganizationContributorsStore = useProjectOrganizationContributorsStore()
const {
  contributors,
  hasLoaded,
  statusState,
  statusMessageKey,
  statusMessageParams
} = storeToRefs(projectOrganizationContributorsStore)

const organizationLabel = computed(() => String(props.organization ?? '').trim())
const showLoading = computed(() => !hasLoaded.value)
const statusClass = computed(() => {
  if (statusState.value === 'success') {
    return 'text-positive'
  }

  if (statusState.value === 'error') {
    return 'text-negative'
  }

  return 'text-grey-7'
})
const statusMessage = computed(() => t(statusMessageKey.value, statusMessageParams.value))

watch(organizationLabel, (nextOrganization) => {
  projectOrganizationContributorsStore.loadContributors(nextOrganization)
}, { immediate: true })
</script>
