import Vue from 'vue';
import VueI18n from 'vue-i18n';

Vue.use(VueI18n);

const loadedLanguages = ['en'];

export const i18n = new VueI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: require('../lang/en')
});

function setI18nLanguage(lang) {
    i18n.locale = lang
    document.querySelector('html').setAttribute('lang', lang)
    return lang
}

export function loadLanguageAsync(lang) {
    if (i18n.locale !== lang) {
        if (!loadedLanguages.includes(lang)) {
            return import(/* webpackChunkName: "lang-[request]" */ `../${lang}.json`).then(msgs => {
                i18n.setLocaleMessage(lang, msgs);
                loadedLanguages.push(lang);
                return setI18nLanguage(lang);
            })
        }
        return Promise.resolve(setI18nLanguage(lang));
    }
    return Promise.resolve(lang);
}
