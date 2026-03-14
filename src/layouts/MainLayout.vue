<template>
  <q-layout view="lHh lpr lFf" class="bottom-layout">
    <q-page-container class="bottom-layout__content">
      <router-view />
    </q-page-container>

    <div
      class="bottom-layout__glass"
      :class="{ 'bottom-layout__glass--visible': isTabOpen }"
      :aria-hidden="isTabOpen ? 'false' : 'true'"
      aria-label="Close open tab"
      role="button"
      tabindex="0"
      @click="closeActiveTab"
      @keyup.enter="closeActiveTab"
      @keyup.space.prevent="closeActiveTab"
    />

    <q-footer
      bordered
      class="bg-white text-dark bottom-dock"
      :class="{ 'bottom-dock--expanded': isExpanded }"
    >
      <div
        v-if="!isMobile"
        class="bottom-dock__panel"
        :class="{ 'bottom-dock__panel--open': isExpanded }"
        :aria-hidden="isExpanded ? 'false' : 'true'"
      >
        <div v-if="expandedTab !== null" class="bottom-dock__panel-toolbar">
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Close open tab"
            class="bottom-dock__panel-close"
            @click="closeActiveTab"
          />
        </div>

        <div class="bottom-dock__panel-scroll">
          <div class="bottom-dock__panel-inner">
            <q-tab-panels v-model="expandedTab" animated class="bottom-dock__panels bg-transparent text-dark">
              <q-tab-panel name="search" class="q-pa-none">
                <SearchDockPanel @submitted="closeActiveTab" />
              </q-tab-panel>

              <q-tab-panel name="submit" class="q-pa-none">
                <SubmitDockPanel />
              </q-tab-panel>

              <q-tab-panel name="login" class="q-pa-none">
                <LoginDockPanel />
              </q-tab-panel>

              <q-tab-panel name="about" class="q-pa-none">
                <AboutDockPanel />
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </div>

      <div class="bottom-dock__bar">
        <router-link to="/" class="bottom-dock__title text-subtitle1 text-weight-medium">
          <span class="brand-lockup">
            <img src="favicon.svg" alt="" class="brand-lockup__icon" aria-hidden="true">
            <span class="brand-lockup__label">{{ t('app.title') }}</span>
          </span>
        </router-link>

        <q-btn
          v-if="isMobile"
          flat
          round
          dense
          icon="menu"
          aria-label="Open dock menu"
          class="bottom-dock__menu-button"
          @click="mobileMenuOpen = true"
        />

        <div v-else class="bottom-dock__tabs-surface">
          <div class="row items-center bottom-dock__tabs">
            <q-btn
              v-for="tab in dockTabs"
              :key="tab.name"
              flat
              no-caps
              dense
              :ripple="false"
              class="bottom-dock__tab text-weight-medium"
              :class="{ 'bottom-dock__tab--active': selectedDockTab === tab.name }"
              :aria-pressed="selectedDockTab === tab.name ? 'true' : 'false'"
              @click="toggleTab(tab.name)"
            >
              <span class="bottom-dock__tab-label text-uppercase">{{ tab.label }}</span>
            </q-btn>
          </div>
        </div>
      </div>
    </q-footer>

    <q-dialog
      v-model="mobileMenuOpen"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="mobile-dock-menu">
        <div class="mobile-dock-menu__header">
          <div class="brand-lockup text-subtitle1 text-weight-medium">
            <img src="favicon.svg" alt="" class="brand-lockup__icon" aria-hidden="true">
            <span class="brand-lockup__label">{{ t('app.title') }}</span>
          </div>
          <q-btn
            flat
            round
            dense
            icon="close"
            aria-label="Close dock menu"
            class="mobile-dock-menu__close"
            @click="mobileMenuOpen = false"
          />
        </div>

        <div class="mobile-dock-menu__items">
          <q-btn
            v-for="tab in dockTabs"
            :key="`mobile-${tab.name}`"
            flat
            no-caps
            align="left"
            :ripple="false"
            class="mobile-dock-menu__item text-left text-uppercase"
            :class="{ 'mobile-dock-menu__item--active': selectedDockTab === tab.name }"
            @click="selectDockTab(tab.name)"
          >
            <span>{{ tab.label }}</span>
          </q-btn>
        </div>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="mobilePanelOpen"
      maximized
      transition-show="slide-left"
      transition-hide="slide-right"
    >
      <q-card class="mobile-dock-panel">
        <div class="mobile-dock-panel__header">
          <q-btn
            flat
            round
            dense
            icon="arrow_back"
            aria-label="Close dock panel"
            class="mobile-dock-panel__back"
            @click="mobilePanelOpen = false"
          />

          <div class="text-subtitle1 text-weight-medium">{{ activeDockTab?.label || t('app.title') }}</div>

          <q-space />
        </div>

        <div class="mobile-dock-panel__body">
          <q-tab-panels
            v-model="expandedTab"
            animated
            swipeable
            transition-prev="jump-right"
            transition-next="jump-left"
            class="bottom-dock__panels bg-transparent text-dark"
          >
            <q-tab-panel name="search" class="q-pa-none">
              <SearchDockPanel @submitted="closeActiveTab" />
            </q-tab-panel>

            <q-tab-panel name="submit" class="q-pa-none">
              <SubmitDockPanel />
            </q-tab-panel>

            <q-tab-panel name="login" class="q-pa-none">
              <LoginDockPanel />
            </q-tab-panel>

            <q-tab-panel name="about" class="q-pa-none">
              <AboutDockPanel />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AboutDockPanel from 'src/components/dock-panels/AboutDockPanel.vue'
import LoginDockPanel from 'src/components/dock-panels/LoginDockPanel.vue'
import SearchDockPanel from 'src/components/dock-panels/SearchDockPanel.vue'
import SubmitDockPanel from 'src/components/dock-panels/SubmitDockPanel.vue'

const $q = useQuasar()
const { t } = useI18n()
const route = useRoute()

const expandedTab = ref(null)
const mobileMenuOpen = ref(false)

const dockTabs = computed(() => [
  { name: 'search', label: t('dock.search.label') },
  { name: 'submit', label: t('dock.submit.label') },
  { name: 'login', label: t('dock.login.label') },
  { name: 'about', label: t('dock.about.label') }
])

const preferredDockTab = computed(() => {
  const query = Array.isArray(route.query.query) ? route.query.query[0] : route.query.query
  const labels = Array.isArray(route.query.label) ? route.query.label : (route.query.label ? [route.query.label] : [])
  const hasQuery = typeof query === 'string' && query.trim()
  const hasLabels = labels.some((label) => typeof label === 'string' && label.trim())

  return hasQuery || hasLabels ? 'search' : null
})

const isMobile = computed(() => $q.screen.lt.sm)
const selectedDockTab = computed(() => expandedTab.value ?? preferredDockTab.value)
const isTabOpen = computed(() => expandedTab.value !== null)
const activeDockTab = computed(() => dockTabs.value.find((tab) => tab.name === selectedDockTab.value) ?? null)
const isExpanded = computed(() => !isMobile.value && expandedTab.value !== null)
const mobilePanelOpen = computed({
  get: () => isMobile.value && expandedTab.value !== null,
  set: (value) => {
    if (!value) {
      expandedTab.value = null
    }
  }
})

function toggleTab (tabName) {
  expandedTab.value = expandedTab.value === tabName ? null : tabName
}

function selectDockTab (tabName) {
  expandedTab.value = tabName
  mobileMenuOpen.value = false
}

function closeActiveTab () {
  expandedTab.value = null
}
</script>

<style scoped lang="scss">
.bottom-layout {
  background:
    radial-gradient(circle at top, rgba($grey-1, 0.92), rgba($grey-2, 0) 36%),
    linear-gradient(180deg, $grey-2 0%, $blue-grey-1 100%);
}

.bottom-layout__content {
  position: relative;
  z-index: 1;
}

.bottom-layout__glass {
  position: fixed;
  inset: 0;
  z-index: 1500;
  pointer-events: none;
  opacity: 0;
  background: linear-gradient(180deg, rgba($grey-1, 0.03), rgba($blue-grey-1, 0.06));
  backdrop-filter: blur(0) saturate(1);
  -webkit-backdrop-filter: blur(0) saturate(1);
  transition:
    opacity 0.42s ease,
    backdrop-filter 0.42s ease,
    -webkit-backdrop-filter 0.42s ease,
    background-color 0.42s ease;
}

.bottom-layout__glass--visible {
  opacity: 1;
  pointer-events: auto;
  background: linear-gradient(180deg, rgba($grey-1, 0.05), rgba($blue-grey-1, 0.09));
  backdrop-filter: blur(2.4px) saturate(1.02);
  -webkit-backdrop-filter: blur(2.4px) saturate(1.02);
}

.bottom-dock {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  overflow: visible;
  background: rgba($grey-2, 0.74);
  backdrop-filter: blur(22px) saturate(1.2);
  border-top-color: rgba($dark-page, 0.08);
  box-shadow: 0 -8px 30px rgba($dark-page, 0.05);
  transition: background-color 0.24s ease, border-color 0.24s ease, box-shadow 0.24s ease;
}

.bottom-dock--expanded {
  background: rgba($grey-1, 0.84);
  border-top-color: rgba($dark-page, 0.1);
  box-shadow: 0 -18px 44px rgba($dark-page, 0.08);
}

.bottom-dock__panel {
  position: absolute;
  right: 0;
  bottom: 100%;
  left: 0;
  height: calc(50vh - 64px);
  border: 1px solid rgba($dark-page, 0.06);
  border-bottom: 0;
  overflow: hidden;
  background: linear-gradient(180deg, rgba($grey-1, 0.48) 0%, rgba($grey-1, 0.82) 26%, rgba($grey-1, 0.92) 100%);
  box-shadow: 0 -18px 44px rgba($dark-page, 0.08);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(12px);
  transition:
    opacity 0.24s ease,
    transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
    visibility 0s linear 0.24s;
  will-change: opacity, transform;
}

.bottom-dock__panel--open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
  transition-delay: 0s;
}

.bottom-dock__panel-scroll {
  height: 100%;
  overflow: auto;
}

.bottom-dock__panel-inner {
  max-width: 960px;
  min-height: 100%;
  margin: 0 auto 0 0;
  padding: 28px 76px 24px 24px;
}

.bottom-dock__panel-toolbar {
  position: absolute;
  top: 16px;
  right: 24px;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  pointer-events: none;
}

.bottom-dock__panel-close {
  pointer-events: auto;
  color: rgba($dark-page, 0.86);
  background: rgba($grey-1, 0.64);
  border: 1px solid rgba($grey-1, 0.7);
  backdrop-filter: blur(12px) saturate(1.08);
}

.bottom-dock__panels {
  min-height: 100%;
}

.bottom-dock__bar {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 6px 20px;
}

.bottom-dock__title {
  display: inline-flex;
  align-items: center;
  color: rgba($dark-page, 0.9);
  letter-spacing: -0.01em;
  text-decoration: none;
}

.brand-lockup {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.brand-lockup__icon {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
  border-radius: 6px;
}

.brand-lockup__label {
  line-height: 1.2;
}

.bottom-dock__menu-button {
  color: rgba($dark-page, 0.86);
  background: rgba($grey-1, 0.38);
  border: 1px solid rgba($grey-1, 0.6);
}

.bottom-dock__tabs-surface {
  display: inline-flex;
  align-items: center;
  align-self: stretch;
  padding: 3px;
  border: 1px solid rgba($grey-1, 0.65);
  border-radius: 0;
  background: rgba($grey-1, 0.44);
  box-shadow:
    inset 0 1px 0 rgba($grey-1, 0.5),
    0 8px 22px rgba($dark-page, 0.05);
  backdrop-filter: blur(16px) saturate(1.1);
}

.bottom-dock__tabs {
  height: 100%;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 4px;
}

.bottom-dock__tab {
  position: relative;
  overflow: hidden;
  align-self: stretch;
  min-height: 100%;
  padding: 0 18px;
  border: 1px solid rgba($dark-page, 0);
  border-radius: 0;
  color: rgba($dark-page, 0.64);
  transform: translateY(0);
  transition: transform 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.bottom-dock__tab::before,
.bottom-dock__tab::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.bottom-dock__tab::before {
  background: rgba($grey-1, 0.9);
  box-shadow:
    inset 0 1px 0 rgba($grey-1, 0.65),
    0 2px 12px rgba($dark-page, 0.06);
  opacity: 0;
  transform: scale(0.96);
}

.bottom-dock__tab::after {
  border: 1px solid rgba($grey-1, 0.68);
  opacity: 0;
  transform: scale(0.98);
}

.bottom-dock__tab:hover {
  color: rgba($dark-page, 0.86);
}

.bottom-dock__tab:hover::before {
  opacity: 0.7;
  transform: scale(1);
}

.bottom-dock__tab:hover::after {
  opacity: 0.65;
  transform: scale(1);
}

.bottom-dock__tab:active {
  transform: scale(0.985);
}

.bottom-dock__tab :deep(.q-btn__content) {
  position: relative;
  z-index: 1;
}

.bottom-dock__tab-label {
  letter-spacing: -0.01em;
}

.bottom-dock__tab--active {
  color: rgba($dark-page, 0.96);
}

.bottom-dock__tab--active::before,
.bottom-dock__tab--active::after {
  opacity: 1;
  transform: scale(1);
}

.mobile-dock-menu {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20px;
  background:
    radial-gradient(circle at top, rgba($grey-1, 0.96), rgba($grey-2, 0.86) 32%, rgba($blue-grey-1, 0.95) 100%);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 24px;
  }

  &__close {
    color: rgba($dark-page, 0.86);
    background: rgba($grey-1, 0.46);
  }

  &__items {
    display: grid;
    gap: 12px;
  }

  &__item {
    justify-content: flex-start;
    min-height: 64px;
    padding: 0 18px;
    border: 1px solid rgba($grey-1, 0.55);
    border-radius: 0;
    background: rgba($grey-1, 0.42);
    color: rgba($dark-page, 0.86);
    font-size: 1rem;
    letter-spacing: -0.01em;

    &--active {
      background: rgba($grey-1, 0.82);
      box-shadow: 0 8px 24px rgba($dark-page, 0.06);
    }
  }
}

.mobile-dock-panel {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background:
    radial-gradient(circle at top, rgba($grey-1, 0.97), rgba($grey-2, 0.9) 28%, rgba($blue-grey-1, 0.98) 100%);
}

.mobile-dock-panel__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba($dark-page, 0.06);
  backdrop-filter: blur(18px) saturate(1.1);
}

.mobile-dock-panel__back {
  color: rgba($dark-page, 0.86);
  background: rgba($grey-1, 0.48);
}

.mobile-dock-panel__body {
  flex: 1;
  overflow: auto;
  padding: 24px 20px 32px;
}

@media (max-width: 640px) {
  .bottom-dock__panel {
    height: calc(50vh - 88px);
  }

  .bottom-dock__bar {
    padding: 10px 16px;
  }
}
</style>
