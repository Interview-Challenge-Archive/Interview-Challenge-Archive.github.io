<template>
  <div class="column q-gutter-md">
    <div>
      <label for="submission-dialog-recruiter-outcome" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.recruiterOutcome') }}</label>
      <q-select
        v-model="draftRecruiterOutcome"
        for="submission-dialog-recruiter-outcome"
        outlined
        dense
        emit-value
        map-options
        :options="recruiterOutcomeOptions"
        :hint="t('dock.submissions.dialog.hints.recruiterOutcome')"
      />
    </div>

    <div>
      <label for="submission-dialog-positive-feedback" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.positiveFeedback') }}</label>
      <q-input
        v-model="draftPositiveFeedback"
        for="submission-dialog-positive-feedback"
        outlined
        dense
        autogrow
        type="textarea"
        :hint="t('dock.submissions.dialog.hints.positiveFeedback')"
      />
    </div>

    <div>
      <label for="submission-dialog-negative-feedback" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.negativeFeedback') }}</label>
      <q-input
        v-model="draftNegativeFeedback"
        for="submission-dialog-negative-feedback"
        outlined
        dense
        autogrow
        type="textarea"
        :hint="t('dock.submissions.dialog.hints.negativeFeedback')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'

const emit = defineEmits(['validity-change'])

const { t } = useI18n()
const submissionWizardStore = useSubmissionWizardStore()
const recruiterOutcomeOptions = computed(() => [
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.offer'), value: 'offer' },
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.nextRound'), value: 'next-round' },
  { label: t('dock.submissions.dialog.recruiterOutcomeOptions.stopped'), value: 'stopped' }
])
const {
  recruiterOutcome,
  positiveFeedback,
  negativeFeedback
} = storeToRefs(submissionWizardStore)

const draftRecruiterOutcome = ref(recruiterOutcome.value)
const draftPositiveFeedback = ref(positiveFeedback.value)
const draftNegativeFeedback = ref(negativeFeedback.value)
const isDirty = ref(false)
const isHydratingFromStore = ref(false)

watch(recruiterOutcome, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftRecruiterOutcome.value = value
    isHydratingFromStore.value = false
  }
})

watch(positiveFeedback, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftPositiveFeedback.value = value
    isHydratingFromStore.value = false
  }
})

watch(negativeFeedback, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftNegativeFeedback.value = value
    isHydratingFromStore.value = false
  }
})

watch(
  [draftRecruiterOutcome, draftPositiveFeedback, draftNegativeFeedback],
  ([nextOutcome, nextPositiveFeedback, nextNegativeFeedback], [previousOutcome, previousPositiveFeedback, previousNegativeFeedback]) => {
    if (isHydratingFromStore.value) {
      return
    }

    if (
      nextOutcome !== previousOutcome
      || nextPositiveFeedback !== previousPositiveFeedback
      || nextNegativeFeedback !== previousNegativeFeedback
    ) {
      isDirty.value = true
    }
  }
)

const canProceed = computed(() => Boolean(String(draftRecruiterOutcome.value ?? '').trim()))

watch(canProceed, (value) => {
  emit('validity-change', value)
}, { immediate: true })

function save () {
  recruiterOutcome.value = String(draftRecruiterOutcome.value ?? '').trim()
  positiveFeedback.value = String(draftPositiveFeedback.value ?? '').trim()
  negativeFeedback.value = String(draftNegativeFeedback.value ?? '').trim()
  isDirty.value = false
}

function resetDraft () {
  draftRecruiterOutcome.value = recruiterOutcome.value
  draftPositiveFeedback.value = positiveFeedback.value
  draftNegativeFeedback.value = negativeFeedback.value
  isDirty.value = false
}

function getCanProceed () {
  return canProceed.value
}

defineExpose({
  save,
  resetDraft,
  getCanProceed
})
</script>
