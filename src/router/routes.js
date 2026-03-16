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
      { path: 'projects/:owner/:repo', name: 'project-detail', component: () => import('pages/ProjectDetailPage.vue') }
    ]
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
