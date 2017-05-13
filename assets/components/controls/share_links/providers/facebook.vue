<template>
    <a title="Share on Facebook" :href="href" class="icon fa-facebook"><span class="label">Facebook</span></a>
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
                return 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(this.url);
            }
        }
    }
</script>