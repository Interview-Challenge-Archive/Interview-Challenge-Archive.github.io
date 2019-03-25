import VueRouter from 'vue-router';

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'homepage',
            component: require('../views/default').default,
            children: [
                {
                    path: ':id',
                    component: require('../views/item').default,
                    name: 'item'
                }
            ],
            meta: {}
        },
        {
            path: '*',
            name: '404',
            component: require('../views/404').default,
            meta: {}
        }
    ]
});

router.beforeEach((to, from, next) => {
    /* if (!to.meta.canSeeForNotLoggedInUsers && !store.getters.isLoggedIn) {
         store.commit('setData', {error: 'To access this area you need first login'});
         next({name: 'login', params: {
                 previous: to.name
             }});
     } else {*/
    next();
    //}
});

export default router;