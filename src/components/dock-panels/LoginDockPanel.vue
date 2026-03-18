<template>
  <div class="login-dock-panel">
    <div class="text-h5 text-uppercase q-mb-sm">{{ t('dock.login.title') }}</div>
    <div class="text-body1 text-grey-7 q-mb-lg">{{ t('dock.login.description') }}</div>

    <div v-if="statusMessage" class="text-body2 q-mb-md" :class="statusClass">
      {{ statusMessage }}
    </div>

    <div class="row justify-center q-col-gutter-sm q-mb-md">
      <div
        v-for="providerConfig in authProviders"
        :key="providerConfig.id"
        class="col-12 col-sm-auto login-dock-panel__action-col"
      >
        <q-btn
          unelevated
          no-caps
          color="dark"
          class="full-width login-dock-panel__provider"
          :label="providerConfig.label"
          :icon="providerConfig.icon"
          :loading="activeProviderId === providerConfig.id"
          :disable="Boolean(activeProviderId) && activeProviderId !== providerConfig.id"
          @click="startLogin(providerConfig)"
        />
      </div>
    </div>

    <div class="text-caption text-grey-6">{{ t('dock.login.helper') }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import appConfig from 'src/config/auth.yml'
import { useSessionStore } from 'src/stores/session-store'

const { t } = useI18n()

const sessionStore = useSessionStore()
const activeProviderId = ref(null)
const statusMessage = ref('')
const statusTone = ref('info')

const authProviders = computed(() => Object.values(appConfig.auth.providers))
const statusClass = computed(() => `text-${statusTone.value}`)

let authPopup = null
let closePollTimer = null
let authListener = null

function resolveProviderLabel (providerId) {
  return authProviders.value.find((providerConfig) => providerConfig.id === providerId)?.label ?? providerId ?? ''
}

function cleanupAuthFlow ({ closePopup = false } = {}) {
  if (authListener && typeof window !== 'undefined') {
    window.removeEventListener('message', authListener)
  }

  if (closePollTimer && typeof window !== 'undefined') {
    window.clearInterval(closePollTimer)
  }

  if (closePopup && authPopup && !authPopup.closed) {
    authPopup.close()
  }

  authListener = null
  closePollTimer = null
  authPopup = null
}

function getPopupFeatures () {
  if (typeof window === 'undefined') {
    return ''
  }

  const { width, height } = appConfig.auth.popup
  const left = Math.max(window.screenX + Math.round((window.outerWidth - width) / 2), 0)
  const top = Math.max(window.screenY + Math.round((window.outerHeight - height) / 2), 0)

  return [
    'popup=yes',
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
    'resizable=yes',
    'scrollbars=yes'
  ].join(',')
}

function handleAuthMessage (event) {
  if (event.origin !== appConfig.auth.serviceOrigin) {
    return
  }

  const message = event.data

  if (!message || message.source !== appConfig.auth.messageSource || message.type !== 'oauth-complete') {
    return
  }

  cleanupAuthFlow({ closePopup: true })
  activeProviderId.value = null

  if (!message.ok || !message.payload) {
    statusTone.value = 'negative'
    statusMessage.value = message.error || t('dock.login.errors.failed')
    return
  }

  sessionStore.setSession(message.payload)
  statusTone.value = 'positive'
  statusMessage.value = t('dock.login.status.connected', {
    provider: resolveProviderLabel(message.payload.provider)
  })
}

function startLogin (providerConfig) {
  if (typeof window === 'undefined') {
    return
  }

  cleanupAuthFlow({ closePopup: true })

  const loginUrl = new URL(providerConfig.loginUrl)

  loginUrl.searchParams.set('mode', 'popup')
  loginUrl.searchParams.set('origin', window.location.origin)

  authPopup = window.open(loginUrl.toString(), appConfig.auth.popup.name, getPopupFeatures())

  if (!authPopup) {
    statusTone.value = 'negative'
    statusMessage.value = t('dock.login.errors.blocked')
    return
  }

  activeProviderId.value = providerConfig.id
  statusMessage.value = ''
  statusTone.value = 'info'
  authListener = (event) => {
    handleAuthMessage(event)
  }
  window.addEventListener('message', authListener)
  closePollTimer = window.setInterval(() => {
    if (authPopup?.closed) {
      cleanupAuthFlow()
      activeProviderId.value = null
      statusTone.value = 'warning'
      statusMessage.value = t('dock.login.errors.cancelled')
    }
  }, appConfig.auth.popup.statusCheckMs)
}

onBeforeUnmount(() => {
  cleanupAuthFlow({ closePopup: true })
})
</script>

<style scoped lang="scss">
.login-dock-panel {
  &__provider {
    justify-content: flex-start;
    min-height: 48px;
  }

  &__action-col {
    @media (min-width: 600px) {
      width: 180px;
    }
  }
}
</style>
