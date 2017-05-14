<template>
    <div class="field multiple">
        <input type="text" name="github_url" id="github_url" readonly
               placeholder="Get your profile url" v-model="value" />
        <button type="button" class="icon fa-github-alt" @click="onButtonClick">Login</button>
        <dialog ref="dialog"></dialog>
    </div>
</template>

<script>
    import hello from 'hellojs';

    export default {
        components: {
            dialog: require(__dirname + '/../dialog/control.vue')
        },
        data() {
            return {
                user: null
            };
        },
        props: {
            redirect_url: {
                type: String,
                required: true
            },
            value: {
                type: String,
                default: () => ''
            }
        },
        computed: {
            auth_provider() {
                return hello('github')
            }
        },
        methods: {
            login() {
                return this.auth_provider.login('github', {
                    display: 'popup',
                    scope: [
                        'user',
                        'read:org'
                    ],
                    redirect_uri: this.redirect_url
                }, function (ret) {
                    //alert('login');
                });
            },
            readUser() {
                return this.auth_provider.api('user');
            },
            onButtonClick() {
                this.login().then(function (ret) {
                    this.$emit('reading_started');
                }, function (e) {
                    this.$emit('error', e.error.message);
                });
            },
            onError(error) {
                this.value = '';
                this.$refs.dialog.type = DialogType.ERROR;
                this.$refs.dialog.showModal(
                    'GitHub error', error.replace('+', ' ')
                );
            },
            onReadingStarted() {
                var self =  this;
                this.readUser().then(function (response) {
                    self.value = response.url;
                    self.user = response;
                    self.$emit('reading_finished');
                }, function (e) {
                    this.$emit('error', e.error.message);
                });
            }
        },
        mounted() {
            this.$on('reading_started', this.onReadingStarted);
            this.$on('error', this.onError);
        }
    }
</script>