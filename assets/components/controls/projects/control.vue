<template>
    <div>
        <item v-for="item in items" :image="item.image" :name="item.name" v-bind:key="item.name"
              :description="item.description"></item>
    </div>
</template>

<script>
    export default {
        components: {
            item: require(__dirname + "/item.vue")
        },
        props: {
            items: {
                type: Array,
                default() {
                    return [];
                }
            }
        }
    }
</script>