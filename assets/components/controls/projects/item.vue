<template>
    <article class="thumb">
        <a href="images/fulls/01.jpg" class="image"><img :src="image" :alt="name"/></a>
        <h2>{{name}}</h2>
        <p>{{description}}</p>
    </article>
</template>

<script>
    export default {
        props: {
            image: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            },
            description: {
                type: String
            }
        }
    }
</script>