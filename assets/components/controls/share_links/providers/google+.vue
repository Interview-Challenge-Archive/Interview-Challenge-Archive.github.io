<template>
    <a title="Share on Google+" :href="href"
       class="icon fa-google-plus"><span
            class="label">Google+</span></a>
</template>

<script>
    export default {
        props: {
            url: {
                type: String,
                required: true
            }
        },
        computed: {
            href() {
                return 'https://plus.google.com/share?url=' + encodeURIComponent(this.url);
            }
        }
    }
</script>