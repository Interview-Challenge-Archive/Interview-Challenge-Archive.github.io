import { describe, expect, it } from 'vitest'
import {
  appendProjects,
  buildProjectCatalog,
  findProjectByRoute,
  getNextLoadedIndex
} from 'src/utils/project-catalog'

describe('project-catalog utils', () => {
  it('builds project records with derived route metadata', () => {
    const [project] = buildProjectCatalog([{
      id: 'demo-project',
      githubUrl: 'https://github.com/MekDrop/demo-project.git',
      languages: ['Vue'],
      tags: []
    }])

    expect(project.owner).toBe('MekDrop')
    expect(project.repo).toBe('demo-project')
    expect(project.projectPath).toBe('MekDrop/demo-project')
    expect(project.primaryLanguage).toBe('Vue')
    expect(project.routeLocation).toEqual({
      name: 'project-detail',
      params: {
        owner: 'MekDrop',
        repo: 'demo-project'
      }
    })
  })

  it('matches routes case-insensitively and paginates immutably', () => {
    const catalog = buildProjectCatalog([
      { id: 'alpha', githubUrl: 'https://github.com/acme/alpha', languages: [] },
      { id: 'beta', githubUrl: 'https://github.com/acme/beta', languages: [] },
      { id: 'gamma', githubUrl: 'https://github.com/acme/gamma', languages: [] }
    ])

    expect(findProjectByRoute(catalog, 'ACME', 'BETA')?.id).toBe('beta')
    expect(getNextLoadedIndex(1, catalog.length, 2)).toBe(3)
    expect(appendProjects(catalog.slice(0, 1), catalog, 1, 3).map(({ id }) => id)).toEqual([
      'alpha',
      'beta',
      'gamma'
    ])
  })
})