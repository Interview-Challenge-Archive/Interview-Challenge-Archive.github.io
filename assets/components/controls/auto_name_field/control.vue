<template>
    <input type="text" :disabled="disabled" :readonly="readonly" :value="value" :placeholder="placeholder"
           :name="name"/>
</template>

<script>
    export default {
        data: () => {
            generatedValue: ''
        },
        props: {
            name: {
                type: String,
                required: true
            },
            disabled: {
                type: Boolean,
                default: () => false
            },
            readonly: {
                type: Boolean,
                default: () => true
            },
            placeholder: {
                type: String
            },
            linkedId: {
                type: String,
                required: true
            },
            value: {
                type: String,
                default: () => this.generatedValue
            }
        },
        computed: {
            linkedField() {
                return document.getElementById(this.linkedId);
            },
            linkedValue() {
                return this.linkedField.value;
            }
        },
        methods: {
            update() {
                if (!this.linkedValue) {
                    this.generatedValue = "";
                } else {
                    this.generatedValue = this.linkedValue.split("/", 2).last().replace(/JobTest|Job Test/g, '').replace(/[_-]/g, ' ').split(' ').map(
                        (str) => str.trim().ucfirst()
                    ).join(' ');
                }
            }
        },
        watch: {
            linkedValue(new_value) {
                this.update();
            }
        },
        mounted() {
            this.update();
        }
    }
</script>