<template>
  <div>
    <div class="text-h5 q-mb-sm">{{ t('dock.about.title') }}</div>
    <div class="text-body1 text-grey-7 q-mb-md">{{ t('dock.about.description') }}</div>
    <div class="text-body2 text-grey-8">{{ t('dock.about.details') }}</div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>