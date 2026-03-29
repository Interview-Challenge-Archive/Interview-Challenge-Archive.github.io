import projectTypeConfig from 'src/config/project_type.yml'

const DEFAULT_KEYWORD_SCORE = 1

function normalizeDetectionParts (parts) {
  return parts
    .map((part) => String(part ?? '').trim().toLowerCase())
    .filter(Boolean)
}

function escapeRegExp (value) {
  return String(value ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function createKeywordPattern (term) {
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}($|[^a-z0-9])`)
}

function normalizeKeyword (keywordConfig) {
  if (typeof keywordConfig === 'string') {
    const [term] = normalizeDetectionParts([keywordConfig])

    if (!term) {
      return null
    }

    return {
      term,
      score: DEFAULT_KEYWORD_SCORE,
      pattern: createKeywordPattern(term)
    }
  }

  if (keywordConfig && typeof keywordConfig === 'object') {
    const [term] = normalizeDetectionParts([keywordConfig.term])

    if (!term) {
      return null
    }

    const numericScore = Number(keywordConfig.score)

    return {
      term,
      score: Number.isFinite(numericScore) && numericScore > 0
        ? numericScore
        : DEFAULT_KEYWORD_SCORE,
      pattern: createKeywordPattern(term)
    }
  }

  return null
}

function normalizeMatcherKeywords (matcherConfig) {
  const keywords = Array.isArray(matcherConfig)
    ? matcherConfig
    : (Array.isArray(matcherConfig?.keywords) ? matcherConfig.keywords : [])

  return keywords
    .map(normalizeKeyword)
    .filter(Boolean)
}

function normalizeMatchers (matchers) {
  if (Array.isArray(matchers)) {
    return matchers
      .map((matcher) => ({
        value: String(matcher?.value ?? '').trim(),
        keywords: normalizeMatcherKeywords(matcher)
      }))
      .filter((matcher) => matcher.value && matcher.keywords.length > 0)
  }

  if (matchers && typeof matchers === 'object') {
    return Object.entries(matchers)
      .map(([value, matcherConfig]) => ({
        value: String(value ?? '').trim(),
        keywords: normalizeMatcherKeywords(matcherConfig)
      }))
      .filter((matcher) => matcher.value && matcher.keywords.length > 0)
  }

  return []
}

const PROJECT_TYPE_MATCHERS = normalizeMatchers(projectTypeConfig?.matchers ?? projectTypeConfig)

export function detectProjectType ({
  topics = [],
  summary = '',
  repository = '',
  languages = []
} = {}) {
  const normalizedText = normalizeDetectionParts([
    ...(Array.isArray(topics) ? topics : []),
    summary,
    repository,
    ...(Array.isArray(languages) ? languages : [])
  ]).join(' ')

  if (!normalizedText) {
    return ''
  }

  const scoresByType = new Map()

  for (const matcher of PROJECT_TYPE_MATCHERS) {
    let matcherScore = 0

    for (const keyword of matcher.keywords) {
      if (keyword.pattern.test(normalizedText)) {
        matcherScore += keyword.score
      }
    }

    if (matcherScore > 0) {
      scoresByType.set(
        matcher.value,
        (scoresByType.get(matcher.value) ?? 0) + matcherScore
      )
    }
  }

  let bestType = ''
  let bestScore = 0

  for (const matcher of PROJECT_TYPE_MATCHERS) {
    const score = scoresByType.get(matcher.value) ?? 0

    if (score > bestScore) {
      bestType = matcher.value
      bestScore = score
    }
  }

  return bestType
}
