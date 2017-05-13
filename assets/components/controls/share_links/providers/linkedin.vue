<template>
    <a title="Share on Linkedin" :href="href" class="icon fa-linkedin"><span class="label">LinkedIn</span></a>
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
            source() {
                return location.toString();
            },
            href() {
                return "https://www.linkedin.com/shareArticle?mini=true&url=" + encodeURIComponent(this.url) + "&title=" + encodeURIComponent(this.subject) + "&summary=" + encodeURIComponent(this.message) + "&source=" + encodeURIComponent(this.source);
            }
        }
    }
</script>