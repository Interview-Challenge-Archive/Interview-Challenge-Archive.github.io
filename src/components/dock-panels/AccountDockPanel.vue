<template>
  <div class="account-dock-panel column no-wrap">
    <div class="text-h5 text-uppercase q-mb-lg">{{ t('dock.account.title') }}</div>

    <div class="account-dock-panel__content row">
      <section class="account-dock-panel__table-col col-12 col-md-7">
        <q-table
          class="account-dock-panel__table"
          flat
          bordered
          dense
          row-key="key"
          :rows="accountRows"
          :columns="columns"
          hide-pagination
          :rows-per-page-options="[0]"
          :pagination="{ rowsPerPage: 0 }"
        >
          <template #body="props">
            <q-tr :props="props" :class="rowClass(props.row)">
              <q-td key="provider" :props="props" class="account-dock-panel__provider">
                <div class="row items-center no-wrap">
                  <q-icon v-if="props.row.providerIcon" :name="props.row.providerIcon" size="18px" class="q-mr-sm" />
                  <span class="text-subtitle2">{{ props.row.providerLabel }}</span>
                </div>
              </q-td>

              <q-td key="account" :props="props" class="account-dock-panel__info">
                <div v-if="props.row.title" class="text-body2 text-weight-medium">{{ props.row.title }}</div>
                <div v-if="props.row.subtitle" class="text-caption text-grey-7">{{ props.row.subtitle }}</div>
              </q-td>

              <q-td key="status" :props="props" class="text-caption text-grey-7">
                {{ props.row.meta }}
              </q-td>

              <q-td key="actions" :props="props" class="account-dock-panel__action text-right">
                <q-btn
                  unelevated
                  no-caps
                  color="dark"
                  :label="props.row.connected ? t('dock.account.actions.disconnect') : t('dock.account.actions.connect')"
                  :loading="activeProviderId === props.row.providerId && !props.row.connected"
                  :disable="actionDisabled(props.row)"
                  @click="handleRowAction(props.row)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </section>

      <section class="account-dock-panel__info-col col-12 col-md">
        <div class="column q-gutter-md">
          <div class="text-body2 text-grey-7">{{ t('dock.account.description') }}</div>
          <div>
            <q-btn
              unelevated
              no-caps
              color="warning"
              text-color="dark"
              :label="t('dock.account.logout')"
              :disable="!accountRows.some((row) => row.connected)"
              @click="logoutAll"
            />
          </div>

          <div v-if="statusMessage" class="text-caption" :class="statusClass">
            {{ statusMessage }}
          </div>
        </div>
      </section>
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
const animatedProviderId = ref('')
const rowAnimationTone = ref('positive')
const statusMessage = ref('')
const statusTone = ref('info')
const columns = computed(() => [
  {
    name: 'provider',
    align: 'left',
    label: t('dock.account.table.columns.provider'),
    field: 'providerLabel'
  },
  {
    name: 'account',
    align: 'left',
    label: t('dock.account.table.columns.account'),
    field: 'title'
  },
  {
    name: 'status',
    align: 'left',
    label: t('dock.account.table.columns.status'),
    field: 'meta'
  },
  {
    name: 'actions',
    align: 'right',
    label: t('dock.account.table.columns.actions'),
    field: 'actions'
  }
])

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
      title: '',
      subtitle: '',
      meta: t('dock.account.rows.notConnected')
    })
  }

  return rows.sort((first, second) => first.providerLabel.localeCompare(second.providerLabel))
})

const statusClass = computed(() => {
  if (statusTone.value === 'negative') {
    return 'text-negative'
  }

  if (statusTone.value === 'warning') {
    return 'text-warning'
  }

  return 'text-grey-7'
})

let authPopup = null
let closePollTimer = null
let authListener = null
let rowAnimationTimer = null

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
      title: '',
      subtitle: '',
      meta: t('dock.account.rows.notConnected')
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
  statusTone.value = 'info'
  statusMessage.value = ''
  animateProviderRow(message.payload.provider, 'positive')
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
  const scopeValue = resolveProviderScope(providerConfig)
  loginUrl.searchParams.set('mode', 'popup')
  loginUrl.searchParams.set('origin', window.location.origin)
  if (scopeValue) {
    loginUrl.searchParams.set('scope', scopeValue)
  }

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
    const providerId = row.providerId
    sessionStore.clearSession(row.accountId)
    statusTone.value = 'info'
    statusMessage.value = ''
    animateProviderRow(providerId, 'positive')
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
  clearRowAnimation()
})

function resolveProviderScope (providerConfig) {
  const rawScopes = providerConfig?.scopes
  const normalizedScopes = Array.isArray(rawScopes)
    ? rawScopes
    : String(rawScopes ?? '')
      .split(/[,\s]+/)

  const uniqueScopes = Array.from(new Set(normalizedScopes
    .map((scope) => String(scope ?? '').trim())
    .filter(Boolean)))

  return uniqueScopes.join(' ')
}

function rowClass (row) {
  return [
    'account-dock-panel__row',
    animatedProviderId.value === row.providerId
      ? `account-dock-panel__row--pulse-${rowAnimationTone.value}`
      : ''
  ]
}

function animateProviderRow (providerId, tone = 'positive') {
  clearRowAnimation()
  animatedProviderId.value = providerId || ''
  rowAnimationTone.value = tone
  rowAnimationTimer = window.setTimeout(() => {
    clearRowAnimation()
  }, 1100)
}

function clearRowAnimation () {
  if (rowAnimationTimer && typeof window !== 'undefined') {
    window.clearTimeout(rowAnimationTimer)
  }

  rowAnimationTimer = null
  animatedProviderId.value = ''
}
</script>

<style scoped lang="scss">
.account-dock-panel {
  height: 100%;
  min-height: 0;

  &__content {
    flex: 1 1 auto;
    min-height: 0;
  }

  &__table-col {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  &__table {
    flex: 1 1 auto;
    min-height: 0;
  }

  &__info-col {
    @media (min-width: 1024px) {
      padding-left: 24px;
    }
  }

  &__row {
    :deep(td) {
      border-bottom: 1px solid rgba($dark-page, 0.06);
      vertical-align: middle;
    }
  }

  &__row--pulse-positive {
    animation: row-pulse-positive 1.1s ease-out;
  }

  &__provider,
  &__info {
    min-width: 0;
  }

  &__action {
    justify-content: flex-start;

    @media (min-width: 768px) {
      justify-content: flex-end;
    }
  }
}

@keyframes row-pulse-positive {
  0% {
    background-color: rgba($positive, 0.18);
  }

  100% {
    background-color: transparent;
  }
}
</style>
