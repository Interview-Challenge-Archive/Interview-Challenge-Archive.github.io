<template>
    <ul class="icons share">
        <li>
            <twiter :message="message" :url="url"></twiter>
        </li>
        <li>
            <facebook :url="url"></facebook>
        </li>
        <li>
            <email :message="message" :url="url" :subject="subject"></email>
        </li>
        <li>
            <linkedin :message="message" :url="url" :subject="subject"></linkedin>
        </li>
        <li>
            <google :url="url"></google>
        </li>
    </ul>
</template>

<script>
    export default {
        components: {
            twitter: require(__dirname + "/providers/twitter.vue"),
            facebook: require(__dirname + "/providers/facebook.vue"),
            email: require(__dirname + "/providers/email.vue"),
            linkedin: require(__dirname + "/providers/linkedin.vue"),
            google: require(__dirname + "/providers/google+.vue")
        },
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
                default() {
                    return 'I found interesting example for job test in JobTestVault';
                }
            }
        }
    }
</script>