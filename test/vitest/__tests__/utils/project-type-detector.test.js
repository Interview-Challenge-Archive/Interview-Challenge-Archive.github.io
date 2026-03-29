import { describe, expect, it } from 'vitest'
import { detectProjectType } from 'src/utils/project-type-detector'

describe('project type utils', () => {
  it('detects software development from frontend keywords', () => {
    expect(detectProjectType({
      topics: ['take-home', 'frontend'],
      summary: 'Build a Vue interface',
      repository: 'repo-a',
      languages: ['JavaScript']
    })).toBe('software-development')
  })

  it('prefers software development for Symfony projects even when docker is present', () => {
    expect(detectProjectType({
      topics: ['symfony', 'docker'],
      summary: 'Build a Symfony API',
      repository: 'symfony-task',
      languages: ['PHP', 'Dockerfile']
    })).toBe('software-development')
  })

  it('detects devops projects from infrastructure keywords', () => {
    expect(detectProjectType({
      topics: ['terraform', 'kubernetes'],
      summary: 'Provision infrastructure with terraform modules',
      repository: 'infra-platform',
      languages: ['HCL']
    })).toBe('devops-infrastructure')
  })

  it('uses keyword scores to decide between competing project types', () => {
    expect(detectProjectType({
      topics: ['frontend', 'kubernetes'],
      summary: 'Assignment with UI and deployment requirements',
      repository: 'task',
      languages: ['HCL']
    })).toBe('devops-infrastructure')
  })

  it('does not match short keywords inside unrelated words', () => {
    expect(detectProjectType({
      topics: [],
      summary: 'Build and maintain release notes for challenge repository',
      repository: 'project-notes',
      languages: ['Markdown']
    })).toBe('')
  })

  it('classifies GameMaker projects as software development', () => {
    expect(detectProjectType({
      topics: ['gamemaker'],
      summary: 'Build a 2D game prototype',
      repository: 'gamemaker-challenge',
      languages: ['GML']
    })).toBe('software-development')
  })

  it('returns empty value when project type cannot be detected', () => {
    expect(detectProjectType({
      topics: ['take-home'],
      summary: 'Assignment repository',
      repository: 'challenge',
      languages: ['Markdown']
    })).toBe('')
  })
})
