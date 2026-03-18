<template>
  <div class="submissions-dock-panel column no-wrap">
    <div class="text-h5 text-uppercase q-mb-lg">{{ t('dock.submissions.title') }}</div>

    <div class="submissions-dock-panel__content row">
      <section class="submissions-dock-panel__table-col col-12 col-md-6">
        <q-table
          class="submissions-dock-panel__table"
          flat
          bordered
          row-key="repoFullName"
          :rows="rows"
          :columns="columns"
          :loading="isLoading"
          hide-pagination
          :rows-per-page-options="[0]"
          :pagination="{ rowsPerPage: 0 }"
          table-style="max-height: 100%;"
        >
          <template #body-cell-repo="props">
            <q-td :props="props">
              <a
                class="text-dark text-weight-medium"
                :href="props.row.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ props.row.repoFullName }}
              </a>
            </q-td>
          </template>

          <template #body-cell-pullRequest="props">
            <q-td :props="props">
              <a
                v-if="props.row.pullRequestUrl"
                class="text-dark"
                :href="props.row.pullRequestUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ props.row.pullRequestLabel }}
              </a>
              <span v-else class="text-grey-7">{{ t('dock.submissions.table.noPullRequest') }}</span>
            </q-td>
          </template>

          <template #body-cell-update="props">
            <q-td :props="props" class="text-right">
              <q-btn
                dense
                no-caps
                color="dark"
                :label="t('dock.submissions.actions.update')"
                @click="openUpdateWizard(props.row)"
              />
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width text-center text-grey-7 q-py-lg">
              {{ isLoading ? t('dock.submissions.table.loading') : t('dock.submissions.table.empty') }}
            </div>
          </template>
        </q-table>
      </section>

      <section class="submissions-dock-panel__info-col col-12 col-md-6">
        <div class="column q-gutter-md">
          <div class="text-body2 text-grey-7">{{ t('dock.submissions.description') }}</div>

          <div class="q-mt-sm">
            <q-btn
              color="dark"
              no-caps
              :label="t('dock.submissions.actions.submit')"
              @click="openSubmitWizard"
            />
          </div>

          <div v-if="statusMessage" class="text-caption" :class="statusTextClass">
            {{ statusMessage }}
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { Dialog } from 'quasar'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import SubmissionWizardDialog from 'src/components/dialogs/SubmissionWizardDialog.vue'
import { useSessionStore } from 'src/stores/session-store'
import { useGitHubSubmissionsStore } from 'src/stores/github-submissions-store'

const { t } = useI18n()
const sessionStore = useSessionStore()
const githubSubmissionsStore = useGitHubSubmissionsStore()
const {
  submissions,
  isLoading,
  hasLoaded,
  errorMessageKey
} = storeToRefs(githubSubmissionsStore)

const hasGitHubSession = computed(() => Boolean(sessionStore.getActiveAccessToken('github')))
const columns = computed(() => [
  {
    name: 'repo',
    align: 'left',
    label: t('dock.submissions.table.columns.repo'),
    field: 'repoFullName'
  },
  {
    name: 'pullRequest',
    align: 'left',
    label: t('dock.submissions.table.columns.pullRequest'),
    field: 'pullRequestLabel'
  },
  {
    name: 'update',
    align: 'right',
    label: t('dock.submissions.table.columns.update'),
    field: 'update'
  }
])
const rows = computed(() => submissions.value.map((submission) => ({
  ...submission,
  pullRequestLabel: submission.pullRequestNumber
    ? `#${submission.pullRequestNumber}`
    : t('dock.submissions.table.noPullRequest')
})))
const statusMessage = computed(() => {
  if (errorMessageKey.value) {
    return t(errorMessageKey.value)
  }

  if (isLoading.value) {
    return ''
  }

  if (!hasLoaded.value) {
    return ''
  }

  if (!rows.value.length) {
    return ''
  }

  return t('dock.submissions.status.loaded', {
    count: rows.value.length
  })
})
const statusTextClass = computed(() => {
  if (errorMessageKey.value) {
    return 'text-negative'
  }

  return 'text-grey-7'
})

watch(hasGitHubSession, (isActive) => {
  if (!isActive) {
    githubSubmissionsStore.reset()
    return
  }

  void githubSubmissionsStore.loadSubmissions()
}, { immediate: true })

function openSubmitWizard () {
  openWizard({
    mode: 'submit'
  })
}

function openUpdateWizard (row) {
  openWizard({
    mode: 'update',
    owner: row.owner,
    repository: row.repository
  })
}

function openWizard ({ mode, owner = '', repository = '' }) {
  Dialog.create({
    component: SubmissionWizardDialog,
    componentProps: {
      mode,
      owner,
      repository
    }
  }).onOk(() => {
    void githubSubmissionsStore.refreshSubmissions()
  })
}
</script>

<style scoped lang="scss">
.submissions-dock-panel {
  height: 100%;
  min-height: 0;

  &__content {
    flex: 1 1 auto;
    min-height: 0;
  }

  &__info-col {
    @media (min-width: 1024px) {
      padding-left: 24px;
    }
  }

  &__table-col {
    display: flex;
    min-height: 0;
  }

  &__table {
    flex: 1 1 auto;
    min-height: 0;

    :deep(.q-table__container) {
      height: 100%;
    }

    :deep(.q-table__middle) {
      max-height: 100%;
    }

    :deep(thead tr th) {
      position: sticky;
      top: 0;
      z-index: 1;
      background: $grey-1;
    }
  }
}
</style>
