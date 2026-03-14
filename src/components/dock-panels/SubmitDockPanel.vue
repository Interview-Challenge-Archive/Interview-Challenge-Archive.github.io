<template>
  <div>
    <div class="text-h5 text-uppercase q-mb-sm">{{ t('dock.submit.title') }}</div>
    <div class="text-body1 text-grey-7">{{ t('dock.submit.description') }}</div>
    <div class="text-caption text-grey-7 q-mt-sm q-mb-lg">{{ t('dock.submit.helper') }}</div>

    <q-form class="column q-gutter-lg">
      <section>
        <div class="text-subtitle2 text-weight-medium">{{ t('dock.submit.sections.basics') }}</div>
        <div class="column q-gutter-md q-mt-sm">
          <q-input v-model="form.entryTitle" outlined :label="t('dock.submit.fields.entryTitle.label')" :hint="t('dock.submit.fields.entryTitle.hint')" />
          <q-input v-model="form.company" outlined :label="t('dock.submit.fields.company.label')" :hint="t('dock.submit.fields.company.hint')" />
          <q-input v-model="form.role" outlined :label="t('dock.submit.fields.role.label')" :hint="t('dock.submit.fields.role.hint')" />
          <q-input v-model="form.sourceUrl" outlined type="url" :label="t('dock.submit.fields.sourceUrl.label')" :hint="t('dock.submit.fields.sourceUrl.hint')" />
          <q-select
            v-model="form.stage"
            outlined
            emit-value
            map-options
            :options="stageOptions"
            :label="t('dock.submit.fields.stage.label')"
            :hint="t('dock.submit.fields.stage.hint')"
          />
        </div>
      </section>

      <q-separator inset />

      <section>
        <div class="text-subtitle2 text-weight-medium">{{ t('dock.submit.sections.technical') }}</div>
        <div class="column q-gutter-md q-mt-sm">
          <q-select
            v-model="form.languages"
            outlined
            multiple
            use-chips
            use-input
            new-value-mode="add-unique"
            input-debounce="0"
            :options="languageSuggestions"
            :label="t('dock.submit.fields.languages.label')"
            :hint="t('dock.submit.fields.languages.hint')"
          />
          <q-select
            v-model="form.stack"
            outlined
            multiple
            use-chips
            use-input
            new-value-mode="add-unique"
            input-debounce="0"
            :options="stackSuggestions"
            :label="t('dock.submit.fields.stack.label')"
            :hint="t('dock.submit.fields.stack.hint')"
          />
          <q-select
            v-model="form.taskType"
            outlined
            emit-value
            map-options
            :options="taskTypeOptions"
            :label="t('dock.submit.fields.taskType.label')"
            :hint="t('dock.submit.fields.taskType.hint')"
          />
          <q-select
            v-model="form.difficulty"
            outlined
            emit-value
            map-options
            :options="difficultyOptions"
            :label="t('dock.submit.fields.difficulty.label')"
            :hint="t('dock.submit.fields.difficulty.hint')"
          />
          <q-input v-model="form.timeLimit" outlined :label="t('dock.submit.fields.timeLimit.label')" :hint="t('dock.submit.fields.timeLimit.hint')" />
          <q-input v-model="form.submittedAt" outlined type="date" :label="t('dock.submit.fields.submittedAt.label')" :hint="t('dock.submit.fields.submittedAt.hint')" />
        </div>
      </section>

      <q-separator inset />

      <section>
        <div class="text-subtitle2 text-weight-medium">{{ t('dock.submit.sections.process') }}</div>
        <div class="column q-gutter-md q-mt-sm">
          <q-select
            v-model="form.reaction"
            outlined
            emit-value
            map-options
            :options="reactionOptions"
            :label="t('dock.submit.fields.reaction.label')"
            :hint="t('dock.submit.fields.reaction.hint')"
          />

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
          <q-input v-model="form.taskSummary" outlined autogrow type="textarea" :label="t('dock.submit.fields.taskSummary.label')" :hint="t('dock.submit.fields.taskSummary.hint')" />
          <q-input v-model="form.deliverables" outlined autogrow type="textarea" :label="t('dock.submit.fields.deliverables.label')" :hint="t('dock.submit.fields.deliverables.hint')" />
          <q-input v-model="form.feedback" outlined autogrow type="textarea" :label="t('dock.submit.fields.feedback.label')" :hint="t('dock.submit.fields.feedback.hint')" />
          <q-input v-model="form.lessons" outlined autogrow type="textarea" :label="t('dock.submit.fields.lessons.label')" :hint="t('dock.submit.fields.lessons.hint')" />
          <q-input v-model="form.notes" outlined autogrow type="textarea" :label="t('dock.submit.fields.notes.label')" :hint="t('dock.submit.fields.notes.hint')" />
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
