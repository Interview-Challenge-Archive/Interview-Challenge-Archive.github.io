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
    components: {
        share_links: import('../components/controls/share_links/control.vue'),
        input_autocomplete: import('../components/controls/input_autocomplete/control.vue'),
        copy_to_clipboard_field: import('../components/controls/copy_to_clipboard_field/control.vue'),
        auto_name_field: import('../components/controls/auto_name_field/control.vue'),
        github_profile_field: import('../components/controls/github_profile_field/control.vue'),
        file_uploader: import('../components/controls/file_uploader/control.vue'),
        linkedin_profile_field: import('../components/controls/linkedin_profile_field/control.vue'),
    }
})).$mount('#wrapper');