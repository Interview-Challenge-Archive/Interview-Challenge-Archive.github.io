import VueRouter from 'vue-router';

let loadView = (view) => () => import(/* webpackChunkName: "views/[request]" */ `../views/${view}.vue`)

const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: 'homepage',
            component: loadView('default'),
            children: [
                {
                    path: ':id',
                    component: loadView('item'),
                    name: 'item'
                }
            ],
            meta: {}
        },
        {
            path: '*',
            name: '404',
            //component: loadView(404),
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