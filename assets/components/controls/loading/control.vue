<template>
    <div class="file item loading" v-show="loading">
        <i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
    </div>
</template>

<script>
    export default {
        props: {
            loading: {
                type: Boolean,
                default: () => false
            }
        },
        watch: {
            loading(new_value) {
                if (new_value) {
                    this.$emit('loading');
                } else {
                    this.$emit('loaded');
                }
            }
        }
    }
</script>