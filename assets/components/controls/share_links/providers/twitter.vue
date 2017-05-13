<template>
    <a title="Share on Twitter" :href="real_url" class="icon fa-twitter"><span class="label">Twitter</span></a>
</template>

<script>
    export default {
        props: {
            message: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        },
        computed: {
            href() {
                return 'https://twitter.com/home?status=' + encodeURIComponent(this.message) + '%20' + encodeURIComponent(this.url);
            }
        }
    }
</script>