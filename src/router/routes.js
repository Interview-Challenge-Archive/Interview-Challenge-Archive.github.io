const routes = [
  {
    path: '/maintenance',
    name: 'site-maintenance',
    component: () => import('pages/SiteMaintenancePage.vue')
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/IndexPage.vue') },
      {
        path: 'projects/:owner/:repo',
        name: 'project-detail',
        component: () => import('pages/ProjectDetailPage.vue'),
        beforeEnter: async (to, from, next) => {
          // Dynamically import store to check if project exists
          const { useGitHubProjectsStore } = await import('src/stores/github-projects-store')
          const store = useGitHubProjectsStore()
          const project = store.projectByRoute(to.params.owner, to.params.repo)

          // If project not found, redirect to catch-all 404 route
          if (!project) {
            next({
              path: '/:catchAll(.*)*',
              params: { pathMatch: to.path.split('/').slice(1) }
            })
          } else {
            next()
          }
        }
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
