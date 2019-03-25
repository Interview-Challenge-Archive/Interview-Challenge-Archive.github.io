import Vue from 'vue';

import Vuex from 'vuex';
import vuexI18n from 'vuex-i18n';
import {loadTranslations} from "./loaders";
import VueRouter from 'vue-router';
import {Button, Collapse, Dropdown, Link, Nav, Navbar} from 'shards-vue/src/components';

Vue.use(Vuex);
Vue.use(vuexI18n.plugin, new Vuex.Store());
Vue.i18n.fallback('en-US');
loadTranslations('en-US').then(
    data => Vue.i18n.add('en-US', data.default)
);
if (typeof LANGUAGES_DATA[navigator.language] !== 'undefined') {
    Vue.i18n.set(navigator.language);
    loadTranslations(navigator.language).then(
        data => Vue.i18n.add(navigator.language, data.default)
    );
} else {
    Vue.i18n.set('en-US');
}

Vue.use(VueRouter);

Vue.use(Nav);
Vue.use(Navbar);
Vue.use(Link);
Vue.use(Dropdown);
Vue.use(Collapse);
Vue.use(Button);

let app = new Vue({
    el: '#wrapper',
    store: require('./store.js').default,
    router: require('./router.js').default,
    name: 'app',
    components: {
        menubar: require('../components/controls/menubar/control').default
    }
});