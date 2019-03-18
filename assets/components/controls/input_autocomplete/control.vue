<template>
    <div>
        <input type="search" :name="name" :list="datalist_id" v-model="value" :disabled="disabled" :readonly="readonly"
               :placeholder="placeholder"/>
        <datalist :id="datalist_id">
            <option v-for="(value, key) in possible_items" :value="value">{{key}}</option>
        </datalist>
    </div>
</template>

<script>
    //    import VueResource from 'vue-resource';

    //  Vue.use(VueResource);

    export default {
        data: () => {
            possible_items: {
            }
            timer: null
        },
        props: {
            name: {
                type: String,
                required: true
            },
            value: {
                type: String,
                default: () => ''
            },
            disabled: {
                type: Boolean,
                default: () => false
            },
            readonly: {
                type: Boolean,
                default: () => false
            },
            placeholder: {
                type: String
            },
            dataSource: {
                type: String
            },
            dataKey: {
                type: String,
            },
            dataMinValue: {
                type: Number,
                default: () => 3
            }
        },
        computed: {
            datalist_id() {
                return this.name + '_datalist';
            }
        },
        watch: {
            value(new_value) {
                if (!new_value || new_value.length < this.dataMinValue) {
                    return;
                }
                if (this.timer) {
                    clearTimeout(this.timer);
                }
                var self = this;
                this.timer = setTimeout(function () {
                        self.update();
                        self.timer = null;
                    }, 500
                );
            }
        },
        methods: {
            update() {
                var self = this;
                this.$http.get(this.dataSource).then(
                    function (response) {
                        if (self.dataKey) {
                            self.possible_items = response.data[self.dataKey];
                        } else {
                            self.possible_items = response.data;
                        }
                    },
                    function (error) {
                        self.$emit('error', {
                            type: 'http',
                            response
                        });
                    }
                )
            }
        },
        mounted() {
            this.$on('error', this.onError);
        }
    }
</script>