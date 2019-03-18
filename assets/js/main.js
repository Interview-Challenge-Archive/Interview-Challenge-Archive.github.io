import Vue from 'vue';
import Vuex from 'vuex';
import VueRouter from 'vue-router';

import '../sass/main.scss';
import '~/font-awesome/scss/font-awesome.scss';
import '~/source-sans-pro/source-sans-pro.css';

Vue.use(Vuex);
Vue.use(VueRouter);

(new Vue({
    store: require('./store.js').default,
    router: require('./router.js').default,
})).$mount('#wrapper');