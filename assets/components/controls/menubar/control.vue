<template>
    <d-navbar :sticky="false" fixed="bottom" theme="dark" toggleable="md" type="dark">
        <d-navbar-toggle target="nav-collapse"></d-navbar-toggle>
        <d-navbar-brand class="brand">
            <d-dropdown dropup menu-class="bg-secondary" theme="dark" toggle-class="bg-dark">
                <template v-slot:button-content>
                    <svg class="heading" dominant-baseline="hanging" width="7em">
                        <defs>
                            <pattern height="100%" id="img-pattern" patternContentUnits="objectBoundingBox"
                                     width="100%">
                                <image :xlink:href="currentLanguageFlag" height="1" width="1"/>
                            </pattern>
                        </defs>
                        <text
                                x="0"
                                y="0">
                            Job
                            <tspan class="bold">Test</tspan>
                            Vault
                        </text>
                    </svg>
                </template>
                <d-dropdown-item :active="(value.locale == currentLanguage)" :key="key"
                                 @click="switchLanguage(value.locale)" active-class="bg-primary text-light"
                                 v-for="(value, key) in languages">
                    <img :alt="value.title" :src="getFlag(value.flag)" style="width: 1em;"/>
                    {{ value.title }}
                </d-dropdown-item>
            </d-dropdown>
        </d-navbar-brand>
        <d-collapse id="nav-collapse" is-nav>
            <d-navbar-nav class="ml-auto">
                <d-nav-item :key="key" href="#" v-for="(value, key) in panels">
                    <span :class="value.iconClass"></span>
                    <span>{{ $t(`components.panels.${value.title}.menu-title`) }}</span>
                </d-nav-item>
            </d-navbar-nav>
        </d-collapse>
    </d-navbar>
</template>

<style lang="scss">
    .brand {
        svg {
            height: 1em;

            text {
                stroke: white;
                stroke-width: 0.2px;
                fill: white;
                transition: fill .4s ease;

                .bold {
                    font-weight: bold;
                }
            }
        }

        .show, &:hover {
            svg {
                text {
                    fill: url(#img-pattern);
                }
            }
        }
    }
</style>

<script>
    const LNG_DATA = LANGUAGES_DATA;

    export default {
        props: {
            bannerUrl: {
                type: String,
                default: () => '/'
            }
        },
        computed: {
            panels() {
                return PANELS_INFO;
            },
            languages() {
                let rez = {};
                for (let x in LNG_DATA) {
                    rez[LNG_DATA[x].locale] = LNG_DATA[x];
                }
                return rez;
            },
            currentLanguage() {
                return this.$i18n.locale();
            },
            currentLanguageFlag() {
                return this.getFlag(this.languages[this.currentLanguage].flag);
            }
        },
        methods: {
            getFlag(flag) {
                return `/flags/${flag}.svg`;
            }
        }
    }
</script>