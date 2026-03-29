<template>
  <div class="column q-gutter-md">
    <div>
      <label for="submission-dialog-company-name" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.companyName') }}</label>
      <q-input
        v-model="draftCompanyName"
        for="submission-dialog-company-name"
        outlined
        dense
        :hint="t('dock.submissions.dialog.hints.companyName')"
      />
    </div>

    <div>
      <label for="submission-dialog-company-linkedin" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.companyLinkedInUrl') }}</label>
      <q-input
        v-model="draftCompanyLinkedInUrl"
        for="submission-dialog-company-linkedin"
        outlined
        dense
        type="url"
        :hint="t('dock.submissions.dialog.hints.companyLinkedInUrl')"
      />
    </div>

    <div>
      <label for="submission-dialog-role" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.positionTitle') }}</label>
      <q-select
        v-model="draftPositionTitle"
        for="submission-dialog-role"
        outlined
        dense
        use-input
        fill-input
        hide-selected
        input-debounce="0"
        new-value-mode="add-unique"
        emit-value
        map-options
        :options="positionTitleOptions"
        :disable="!projectType"
        :hint="t('dock.submissions.dialog.hints.positionTitle')"
        @input-value="onRoleInputValue"
        @new-value="onRoleNewValue"
        @blur="onRoleBlur"
      />
    </div>

    <div>
      <label for="submission-dialog-level" class="text-caption text-grey-8 q-mb-xs">{{ t('dock.submissions.dialog.fields.positionLevel') }}</label>
      <q-select
        v-model="draftPositionLevel"
        for="submission-dialog-level"
        outlined
        dense
        use-input
        fill-input
        hide-selected
        input-debounce="0"
        new-value-mode="add-unique"
        emit-value
        map-options
        :options="positionLevelOptions"
        :disable="!projectType"
        :hint="t('dock.submissions.dialog.hints.positionLevel')"
        @input-value="onLevelInputValue"
        @new-value="onLevelNewValue"
        @blur="onLevelBlur"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useSubmissionWizardStore } from 'src/stores/submission-wizard-store'
import positionRolesConfig from 'src/config/position_roles.yml'

const emit = defineEmits(['validity-change'])
const PREDEFINED_SELECT_VALUE_PREFIX = '::'

const { t } = useI18n()
const submissionWizardStore = useSubmissionWizardStore()
const {
  projectType,
  companyName,
  companyLinkedInUrl,
  positionTitle,
  positionLevel
} = storeToRefs(submissionWizardStore)

const draftCompanyName = ref(companyName.value)
const draftCompanyLinkedInUrl = ref(companyLinkedInUrl.value)
const draftPositionTitle = ref(positionTitle.value)
const draftPositionLevel = ref(positionLevel.value)
const roleInputValue = ref('')
const levelInputValue = ref('')
const isDirty = ref(false)
const isHydratingFromStore = ref(false)
const positionTitleOptionKeys = computed(() => {
  const normalizedProjectType = String(projectType.value ?? '').trim()

  if (!normalizedProjectType) {
    return []
  }

  const configuredOptions = positionRolesConfig?.positionTitlesByProjectType?.[normalizedProjectType]

  return Array.isArray(configuredOptions)
    ? configuredOptions
    : []
})
const positionLevelOptionKeys = computed(() => {
  const normalizedProjectType = String(projectType.value ?? '').trim()
  const optionsByProjectType = positionRolesConfig?.positionLevelsByProjectType ?? {}
  const projectSpecificOptions = optionsByProjectType[normalizedProjectType]

  if (Array.isArray(projectSpecificOptions) && projectSpecificOptions.length) {
    return projectSpecificOptions
  }

  return Array.isArray(optionsByProjectType.default)
    ? optionsByProjectType.default
    : []
})
const positionTitleOptions = computed(() =>
  positionTitleOptionKeys.value.map((optionKey) => ({
    label: t(`dock.submissions.dialog.positionTitleOptions.${optionKey}`),
    value: encodePredefinedSelectValue(optionKey)
  })))
const positionLevelOptions = computed(() =>
  positionLevelOptionKeys.value.map((optionKey) => ({
    label: t(`dock.submissions.dialog.positionLevelOptions.${optionKey}`),
    value: encodePredefinedSelectValue(optionKey)
  })))

watch(companyName, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftCompanyName.value = value
    isHydratingFromStore.value = false
  }
})

watch(companyLinkedInUrl, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftCompanyLinkedInUrl.value = value
    isHydratingFromStore.value = false
  }
})

watch(positionTitle, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftPositionTitle.value = value
    isHydratingFromStore.value = false
  }
})

watch(positionLevel, (value) => {
  if (!isDirty.value) {
    isHydratingFromStore.value = true
    draftPositionLevel.value = value
    isHydratingFromStore.value = false
  }
})

watch(
  [draftCompanyName, draftCompanyLinkedInUrl, draftPositionTitle, draftPositionLevel],
  ([nextCompanyName, nextCompanyLinkedInUrl, nextPositionTitle, nextPositionLevel], [previousCompanyName, previousCompanyLinkedInUrl, previousPositionTitle, previousPositionLevel]) => {
    if (isHydratingFromStore.value) {
      return
    }

    if (
      nextCompanyName !== previousCompanyName
      || nextCompanyLinkedInUrl !== previousCompanyLinkedInUrl
      || nextPositionTitle !== previousPositionTitle
      || nextPositionLevel !== previousPositionLevel
    ) {
      isDirty.value = true
    }
  }
)

const canProceed = computed(() =>
  Boolean(String(draftCompanyName.value ?? '').trim())
  && Boolean(String(draftPositionTitle.value ?? '').trim())
  && Boolean(String(draftPositionLevel.value ?? '').trim()))

watch(canProceed, (value) => {
  emit('validity-change', value)
}, { immediate: true })

function save () {
  companyName.value = String(draftCompanyName.value ?? '').trim()
  companyLinkedInUrl.value = String(draftCompanyLinkedInUrl.value ?? '').trim()
  positionTitle.value = String(draftPositionTitle.value ?? '').trim()
  positionLevel.value = String(draftPositionLevel.value ?? '').trim()
  isDirty.value = false
}

function resetDraft () {
  draftCompanyName.value = companyName.value
  draftCompanyLinkedInUrl.value = companyLinkedInUrl.value
  draftPositionTitle.value = positionTitle.value
  draftPositionLevel.value = positionLevel.value
  roleInputValue.value = ''
  levelInputValue.value = ''
  isDirty.value = false
}

function onRoleInputValue (value) {
  roleInputValue.value = String(value ?? '')
}

function onLevelInputValue (value) {
  levelInputValue.value = String(value ?? '')
}

function onRoleNewValue (value, done) {
  onCustomSelectValue(draftPositionTitle, roleInputValue, positionTitleOptions.value, value, done)
}

function onLevelNewValue (value, done) {
  onCustomSelectValue(draftPositionLevel, levelInputValue, positionLevelOptions.value, value, done)
}

function onRoleBlur () {
  commitSelectInputValue(draftPositionTitle, roleInputValue, positionTitleOptions.value)
}

function onLevelBlur () {
  commitSelectInputValue(draftPositionLevel, levelInputValue, positionLevelOptions.value)
}

function commitSelectInputValue (fieldReference, inputReference, options) {
  const normalizedInput = String(inputReference.value ?? '').trim()

  if (!normalizedInput) {
    return
  }

  const normalizedSelectedValue = String(fieldReference.value ?? '').trim()

  if (normalizedSelectedValue) {
    const selectedLabel = resolveOptionLabelByValue(options, normalizedSelectedValue)

    if (selectedLabel && selectedLabel === normalizedInput) {
      inputReference.value = ''
      return
    }

    if (!selectedLabel && normalizedSelectedValue === normalizedInput) {
      inputReference.value = ''
      return
    }
  }

  applyCustomSelectValue(fieldReference, inputReference, options, normalizedInput)
}

function onCustomSelectValue (fieldReference, inputReference, options, value, done) {
  const normalizedValue = applyCustomSelectValue(fieldReference, inputReference, options, value)

  if (!normalizedValue) {
    done(null)
    return
  }

  done(normalizedValue)
}

function applyCustomSelectValue (fieldReference, inputReference, options, value) {
  const normalizedValue = String(value ?? '').trim()

  if (!normalizedValue) {
    return ''
  }

  const predefinedValue = resolveOptionValueByLabel(options, normalizedValue)
  fieldReference.value = predefinedValue || normalizedValue
  inputReference.value = ''
  return fieldReference.value
}

function resolveOptionLabelByValue (options, value) {
  const normalizedValue = String(value ?? '').trim()

  return options.find((option) => option.value === normalizedValue)?.label ?? ''
}

function resolveOptionValueByLabel (options, label) {
  const normalizedLabel = String(label ?? '').trim().toLowerCase()

  if (!normalizedLabel) {
    return ''
  }

  return options.find((option) =>
    String(option?.label ?? '').trim().toLowerCase() === normalizedLabel
  )?.value ?? ''
}

function encodePredefinedSelectValue (optionKey) {
  return `${PREDEFINED_SELECT_VALUE_PREFIX}${String(optionKey ?? '').trim()}`
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
