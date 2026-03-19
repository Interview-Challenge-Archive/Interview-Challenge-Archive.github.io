<template>
  <div>
    <div class="text-h5 text-uppercase q-mb-sm">{{ t('dock.submit.title') }}</div>
    <div class="text-body1 text-grey-7">{{ t('dock.submit.description') }}</div>
    <div class="text-caption text-grey-7 q-mt-sm q-mb-lg">{{ t('dock.submit.helper') }}</div>

    <q-form class="column q-gutter-lg">
      <section>
        <div class="text-subtitle2 text-weight-medium">{{ t('dock.submit.sections.basics') }}</div>
        <div class="column q-gutter-md q-mt-sm">
          <div>
            <label for="submit-entry-title" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.entryTitle.label') }}</label>
            <q-input v-model="form.entryTitle" for="submit-entry-title" outlined dense :hint="t('dock.submit.fields.entryTitle.hint')" />
          </div>
          <div>
            <label for="submit-company" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.company.label') }}</label>
            <q-input v-model="form.company" for="submit-company" outlined dense :hint="t('dock.submit.fields.company.hint')" />
          </div>
          <div>
            <label for="submit-role" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.role.label') }}</label>
            <q-input v-model="form.role" for="submit-role" outlined dense :hint="t('dock.submit.fields.role.hint')" />
          </div>
          <div>
            <label for="submit-source-url" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.sourceUrl.label') }}</label>
            <q-input v-model="form.sourceUrl" for="submit-source-url" outlined dense type="url" :hint="t('dock.submit.fields.sourceUrl.hint')" />
          </div>
          <div>
            <label for="submit-stage" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.stage.label') }}</label>
            <q-select
              v-model="form.stage"
              for="submit-stage"
              outlined
              dense
              emit-value
              map-options
              :options="stageOptions"
              :hint="t('dock.submit.fields.stage.hint')"
            />
          </div>
        </div>
      </section>

      <q-separator inset />

      <section>
        <div class="text-subtitle2 text-weight-medium">{{ t('dock.submit.sections.technical') }}</div>
        <div class="column q-gutter-md q-mt-sm">
          <div>
            <label for="submit-languages" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.languages.label') }}</label>
            <q-select
              v-model="form.languages"
              for="submit-languages"
              outlined
              dense
              multiple
              use-chips
              use-input
              new-value-mode="add-unique"
              input-debounce="0"
              :options="languageSuggestions"
              :hint="t('dock.submit.fields.languages.hint')"
            />
          </div>
          <div>
            <label for="submit-stack" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.stack.label') }}</label>
            <q-select
              v-model="form.stack"
              for="submit-stack"
              outlined
              dense
              multiple
              use-chips
              use-input
              new-value-mode="add-unique"
              input-debounce="0"
              :options="stackSuggestions"
              :hint="t('dock.submit.fields.stack.hint')"
            />
          </div>
          <div>
            <label for="submit-task-type" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.taskType.label') }}</label>
            <q-select
              v-model="form.taskType"
              for="submit-task-type"
              outlined
              dense
              emit-value
              map-options
              :options="taskTypeOptions"
              :hint="t('dock.submit.fields.taskType.hint')"
            />
          </div>
          <div>
            <label for="submit-difficulty" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.difficulty.label') }}</label>
            <q-select
              v-model="form.difficulty"
              for="submit-difficulty"
              outlined
              dense
              emit-value
              map-options
              :options="difficultyOptions"
              :hint="t('dock.submit.fields.difficulty.hint')"
            />
          </div>
          <div>
            <label for="submit-time-limit" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.timeLimit.label') }}</label>
            <q-input v-model="form.timeLimit" for="submit-time-limit" outlined dense :hint="t('dock.submit.fields.timeLimit.hint')" />
          </div>
          <div>
            <label for="submit-submitted-at" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.submittedAt.label') }}</label>
            <q-input v-model="form.submittedAt" for="submit-submitted-at" outlined dense type="date" :hint="t('dock.submit.fields.submittedAt.hint')" />
          </div>
        </div>
      </section>

      <q-separator inset />

      <section>
        <div class="text-subtitle2 text-weight-medium">{{ t('dock.submit.sections.process') }}</div>
        <div class="column q-gutter-md q-mt-sm">
          <div>
            <label for="submit-reaction" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.reaction.label') }}</label>
            <q-select
              v-model="form.reaction"
              for="submit-reaction"
              outlined
              dense
              emit-value
              map-options
              :options="reactionOptions"
              :hint="t('dock.submit.fields.reaction.hint')"
            />
          </div>

          <div>
            <div class="text-body2 text-weight-medium">{{ t('dock.submit.offer.label') }}</div>
            <div class="text-caption text-grey-7 q-mt-xs q-mb-sm">{{ t('dock.submit.offer.hint') }}</div>
            <q-option-group v-model="form.offerOutcome" inline color="dark" type="radio" :options="offerOptions" />
          </div>

          <div class="column q-gutter-sm">
            <q-checkbox v-model="form.wasSubmitted" color="dark" :label="t('dock.submit.flags.submitted.label')" />
            <q-checkbox v-model="form.publicRepo" color="dark" :label="t('dock.submit.flags.publicRepo.label')" />
            <q-checkbox v-model="form.ndaRestricted" color="dark" :label="t('dock.submit.flags.nda.label')" />
          </div>
        </div>
      </section>

      <q-separator inset />

      <section>
        <div class="text-subtitle2 text-weight-medium">{{ t('dock.submit.sections.notes') }}</div>
        <div class="column q-gutter-md q-mt-sm">
          <div>
            <label for="submit-task-summary" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.taskSummary.label') }}</label>
            <q-input v-model="form.taskSummary" for="submit-task-summary" outlined dense autogrow type="textarea" :hint="t('dock.submit.fields.taskSummary.hint')" />
          </div>
          <div>
            <label for="submit-deliverables" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.deliverables.label') }}</label>
            <q-input v-model="form.deliverables" for="submit-deliverables" outlined dense autogrow type="textarea" :hint="t('dock.submit.fields.deliverables.hint')" />
          </div>
          <div>
            <label for="submit-feedback" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.feedback.label') }}</label>
            <q-input v-model="form.feedback" for="submit-feedback" outlined dense autogrow type="textarea" :hint="t('dock.submit.fields.feedback.hint')" />
          </div>
          <div>
            <label for="submit-lessons" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.lessons.label') }}</label>
            <q-input v-model="form.lessons" for="submit-lessons" outlined dense autogrow type="textarea" :hint="t('dock.submit.fields.lessons.hint')" />
          </div>
          <div>
            <label for="submit-notes" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submit.fields.notes.label') }}</label>
            <q-input v-model="form.notes" for="submit-notes" outlined dense autogrow type="textarea" :hint="t('dock.submit.fields.notes.hint')" />
          </div>
        </div>
      </section>
    </q-form>

    <div class="row justify-end q-mt-md">
      <q-btn color="dark" no-caps :label="t('dock.submit.action')" />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const form = reactive({
  entryTitle: '',
  company: '',
  role: '',
  sourceUrl: '',
  stage: null,
  languages: [],
  stack: [],
  taskType: null,
  difficulty: null,
  timeLimit: '',
  submittedAt: '',
  reaction: null,
  offerOutcome: 'pending',
  wasSubmitted: true,
  publicRepo: false,
  ndaRestricted: false,
  taskSummary: '',
  deliverables: '',
  feedback: '',
  lessons: '',
  notes: ''
})

const languageSuggestions = computed(() => [
  'JavaScript',
  'TypeScript',
  'Vue',
  'React',
  'Python',
  'Java',
  'Go',
  'SQL'
])

const stackSuggestions = computed(() => [
  'Quasar',
  'Pinia',
  'Node.js',
  'Express',
  'PostgreSQL',
  'Docker',
  'AWS',
  'Figma'
])

const stageOptions = computed(() => [
  { label: t('dock.submit.stageOptions.applied'), value: 'applied' },
  { label: t('dock.submit.stageOptions.recruiterScreen'), value: 'recruiter-screen' },
  { label: t('dock.submit.stageOptions.takeHome'), value: 'take-home' },
  { label: t('dock.submit.stageOptions.technicalInterview'), value: 'technical-interview' },
  { label: t('dock.submit.stageOptions.finalRound'), value: 'final-round' },
  { label: t('dock.submit.stageOptions.selfDirected'), value: 'self-directed' }
])

const taskTypeOptions = computed(() => [
  { label: t('dock.submit.taskTypeOptions.takeHome'), value: 'take-home' },
  { label: t('dock.submit.taskTypeOptions.liveCoding'), value: 'live-coding' },
  { label: t('dock.submit.taskTypeOptions.systemDesign'), value: 'system-design' },
  { label: t('dock.submit.taskTypeOptions.bugFix'), value: 'bug-fix' },
  { label: t('dock.submit.taskTypeOptions.featureBuild'), value: 'feature-build' },
  { label: t('dock.submit.taskTypeOptions.research'), value: 'research' }
])

const difficultyOptions = computed(() => [
  { label: t('dock.submit.difficultyOptions.lightweight'), value: 'lightweight' },
  { label: t('dock.submit.difficultyOptions.moderate'), value: 'moderate' },
  { label: t('dock.submit.difficultyOptions.demanding'), value: 'demanding' }
])

const reactionOptions = computed(() => [
  { label: t('dock.submit.reactionOptions.noResponse'), value: 'no-response' },
  { label: t('dock.submit.reactionOptions.followUp'), value: 'follow-up' },
  { label: t('dock.submit.reactionOptions.nextRound'), value: 'next-round' },
  { label: t('dock.submit.reactionOptions.positiveFeedback'), value: 'positive-feedback' },
  { label: t('dock.submit.reactionOptions.rejected'), value: 'rejected' }
])

const offerOptions = computed(() => [
  { label: t('dock.submit.offer.options.pending'), value: 'pending' },
  { label: t('dock.submit.offer.options.yes'), value: 'yes' },
  { label: t('dock.submit.offer.options.no'), value: 'no' },
  { label: t('dock.submit.offer.options.withdrawn'), value: 'withdrawn' },
  { label: t('dock.submit.offer.options.notApplicable'), value: 'not-applicable' }
])
</script>
