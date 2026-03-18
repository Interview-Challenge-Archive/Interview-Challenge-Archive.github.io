<template>
  <div class="row q-gutter-sm">
    <q-btn
      v-for="socialLink in normalizedSocialLinks"
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
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  socialLinks: {
    type: Array,
    default: () => []
  }
})

const normalizedSocialLinks = computed(() =>
  props.socialLinks.filter((socialLink) => socialLink?.id && socialLink?.url)
)
</script>
