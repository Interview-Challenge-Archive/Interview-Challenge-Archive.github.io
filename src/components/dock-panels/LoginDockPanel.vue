<template>
  <div>
    <div class="text-h5 text-uppercase q-mb-sm">{{ t('dock.login.title') }}</div>
    <div class="text-body1 text-grey-7 q-mb-lg">{{ t('dock.login.description') }}</div>
    <div class="column q-gutter-md">
      <q-input outlined type="email" :label="t('dock.login.email')" />
      <q-input outlined type="password" :label="t('dock.login.password')" />
    </div>
    <div class="row justify-end q-mt-md">
      <q-btn color="dark" no-caps :label="t('dock.login.action')" />
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
