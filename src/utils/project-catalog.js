function parseGitHubProjectUrl (githubUrl) {
  const match = githubUrl?.match(/^https?:\/\/github\.com\/([^/]+)\/([^/?#]+)/i)

  if (!match) {
    return null
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, '')
  }
}

export function buildProjectRecord (project) {
  const parsedProjectUrl = parseGitHubProjectUrl(project.githubUrl)
  const owner = parsedProjectUrl?.owner ?? 'projects'
  const repo = parsedProjectUrl?.repo ?? project.id
  const transitionName = `project-card-${owner}-${repo}`
    .replace(/[^a-z0-9-]/gi, '-')
    .toLowerCase()

  return {
    ...project,
    owner,
    repo,
    projectPath: `${owner}/${repo}`,
    primaryLanguage: project.languages?.[0] ?? 'Unknown',
    routeLocation: {
      name: 'project-detail',
      params: {
        owner,
        repo
      }
    },
    transitionName
  }
}

export const buildProjectCatalog = (projects) => projects.map(buildProjectRecord)

const normalizeRouteSegment = (segment) => String(segment ?? '').toLowerCase()

export function findProjectByRoute (catalog, owner, repo) {
  const normalizedOwner = normalizeRouteSegment(owner)
  const normalizedRepo = normalizeRouteSegment(repo)

  return catalog.find((item) => (
    normalizeRouteSegment(item.owner) === normalizedOwner
    && normalizeRouteSegment(item.repo) === normalizedRepo
  )) ?? null
}

export const getNextLoadedIndex = (lastLoadedIndex, catalogLength, pageSize) => Math.min(
  lastLoadedIndex + pageSize,
  catalogLength
)

export const appendProjects = (items, catalog, startIndex, endIndex) => [
  ...items,
  ...catalog.slice(startIndex, endIndex)
]