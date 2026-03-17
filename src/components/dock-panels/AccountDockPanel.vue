<template>
  <div class="account-dock-panel">
    <div class="text-h5 text-uppercase q-mb-sm">{{ t('dock.account.title') }}</div>
    <div class="text-body1 text-grey-7 q-mb-lg">{{ t('dock.account.description') }}</div>

    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle2 text-grey-8">{{ t('dock.account.connectedAccounts') }}</div>
      <q-btn
        flat
        no-caps
        color="dark"
        :label="t('dock.account.logout')"
        :disable="!accountRows.some((row) => row.connected)"
        @click="logoutAll"
      />
    </div>

    <div v-if="statusMessage" class="text-body2 q-mb-md" :class="statusClass">
      {{ statusMessage }}
    </div>

    <div class="account-dock-panel__list">
      <div
        v-for="row in accountRows"
        :key="row.key"
        class="account-dock-panel__row bg-grey-1"
      >
        <div class="account-dock-panel__provider">
          <q-icon v-if="row.providerIcon" :name="row.providerIcon" size="18px" class="q-mr-sm" />
          <span class="text-subtitle2">{{ row.providerLabel }}</span>
        </div>

        <div class="account-dock-panel__info">
          <div v-if="row.title" class="text-body2 text-weight-medium">{{ row.title }}</div>
          <div v-if="row.subtitle" class="text-caption text-grey-7">{{ row.subtitle }}</div>
          <div v-if="row.meta" class="text-caption text-grey-7">{{ row.meta }}</div>
        </div>

        <div class="account-dock-panel__action">
          <q-btn
            unelevated
            no-caps
            color="dark"
            :label="row.connected ? t('dock.account.actions.disconnect') : t('dock.account.actions.connect')"
            :loading="activeProviderId === row.providerId && !row.connected"
            :disable="actionDisabled(row)"
            @click="handleRowAction(row)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import appConfig from 'src/config/auth.yml'
import { useSessionStore } from 'src/stores/session-store'

const { t } = useI18n()
const sessionStore = useSessionStore()

const authProviders = computed(() => Object.values(appConfig.auth.providers))
const activeProviderId = ref(null)
const statusMessage = ref('')
const statusTone = ref('info')

const accountRows = computed(() => {
  const providerIdsInRows = new Set()
  const rows = Object.entries(sessionStore.accounts).map(([accountId, store]) => {
    const providerId = resolveProviderId(store, accountId)
    const providerConfig = resolveProvider(providerId)
    const connected = isConnectedAccount(store)
    const details = buildAccountDetails(store, connected)

    if (providerId) {
      providerIdsInRows.add(providerId)
    }

    return {
      key: accountId,
      accountId,
      providerId,
      providerIcon: providerConfig?.icon ?? '',
      providerLabel: providerConfig?.label ?? providerId ?? t('dock.account.unknownProvider'),
      connected,
      title: details.title,
      subtitle: details.subtitle,
      meta: details.meta
    }
  })

  for (const providerConfig of authProviders.value) {
    if (providerIdsInRows.has(providerConfig.id)) {
      continue
    }

    rows.push({
      key: `provider:${providerConfig.id}`,
      accountId: null,
      providerId: providerConfig.id,
      providerIcon: providerConfig.icon,
      providerLabel: providerConfig.label,
      connected: false,
      title: t('dock.account.rows.notConnected'),
      subtitle: '',
      meta: ''
    })
  }

  return rows.sort((first, second) => {
    if (first.connected !== second.connected) {
      return first.connected ? -1 : 1
    }

    return first.providerLabel.localeCompare(second.providerLabel)
  })
})

const statusClass = computed(() => `text-${statusTone.value}`)

let authPopup = null
let closePollTimer = null
let authListener = null

function resolveProvider (providerId) {
  return authProviders.value.find((providerConfig) => providerConfig.id === providerId) ?? null
}

function resolveProviderId (store, accountId) {
  if (store?.provider) {
    return store.provider
  }

  const [providerId] = String(accountId || '').split(':')
  return providerId || ''
}

function resolveExpirationTimestamp (store) {
  if (!Number.isFinite(store?.expiresIn) || store.expiresIn <= 0) {
    return null
  }

  const authenticatedAt = Date.parse(store.authenticatedAt)

  if (!Number.isFinite(authenticatedAt)) {
    return null
  }

  return authenticatedAt + (store.expiresIn * 1000)
}

function isConnectedAccount (store) {
  if (!store || !store.provider || !store.accessToken || !store.user) {
    return false
  }

  const expirationTimestamp = resolveExpirationTimestamp(store)

  if (!Number.isFinite(expirationTimestamp)) {
    return true
  }

  return expirationTimestamp > Date.now()
}

function buildAccountDetails (store, connected) {
  if (!store?.user || typeof store.user !== 'object') {
    return {
      title: t('dock.account.rows.notConnected'),
      subtitle: '',
      meta: ''
    }
  }

  const title = store.displayName || store.user.name || store.user.login || store.user.email || ''
  const subtitle = store.email || (store.loginHandle ? `@${store.loginHandle}` : '')
  const expirationTimestamp = resolveExpirationTimestamp(store)
  const meta = connected
    ? t('dock.account.rows.connected')
    : Number.isFinite(expirationTimestamp)
      ? t('dock.account.rows.expired')
      : t('dock.account.rows.notConnected')

  return { title, subtitle, meta }
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
  statusMessage.value = t('dock.account.status.connected', {
    provider: resolveProvider(message.payload.provider)?.label ?? message.payload.provider
  })
}

function startLogin (providerId) {
  if (typeof window === 'undefined') {
    return
  }

  const providerConfig = resolveProvider(providerId)

  if (!providerConfig) {
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

function actionDisabled (row) {
  if (row.connected) {
    return false
  }

  return !resolveProvider(row.providerId)
    || (Boolean(activeProviderId.value) && activeProviderId.value !== row.providerId)
}

function handleRowAction (row) {
  if (row.connected) {
    sessionStore.clearSession(row.accountId)
    statusTone.value = 'info'
    statusMessage.value = t('dock.account.status.disconnected', { provider: row.providerLabel })
    return
  }

  startLogin(row.providerId)
}

function logoutAll () {
  cleanupAuthFlow({ closePopup: true })
  activeProviderId.value = null
  statusTone.value = 'info'
  statusMessage.value = ''
  sessionStore.logout()
}

onBeforeUnmount(() => {
  cleanupAuthFlow({ closePopup: true })
})
</script>

<style scoped lang="scss">
.account-dock-panel__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.account-dock-panel__row {
  display: grid;
  grid-template-columns: minmax(140px, 1fr) minmax(220px, 2fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba($dark-page, 0.06);
  padding: 12px;
}

.account-dock-panel__provider {
  display: flex;
  align-items: center;
  min-width: 0;
}

.account-dock-panel__info {
  min-width: 0;
}

.account-dock-panel__action {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .account-dock-panel__row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .account-dock-panel__action {
    justify-content: flex-start;
  }
}
</style>
