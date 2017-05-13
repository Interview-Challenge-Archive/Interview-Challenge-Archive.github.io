<template>
    <a title="Share by email" :href="href" class="icon fa-envelope"><span class="label">E-mail</span></a>
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
            },
            subject: {
                type: String,
                required: true
            }
        },
        computed: {
            href() {
                return "mailto:?&subject=" + encodeURIComponent(this.subject) + "&body=" + encodeURIComponent(this.message) + "%20" + encodeURIComponent(this.url);
            }
        }
    }
</script>