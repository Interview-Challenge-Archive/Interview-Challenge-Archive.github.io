export function loadView(view) {
    return import(/* webpackChunkName: "[request]" */ `../views/${view}.vue`);
}

export function loadControl(component) {
    return import(/* webpackChunkName: "[request]" */ `../components/controls/${component}/control.vue`);
}

export function loadTranslations(locale) {
    return import(/* webpackChunkName: "lang-[request]" */`../lang/${locale}/translations.yaml`);
}