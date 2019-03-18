<template>
    <div>
        <input type="text" name="linkedin" readonly
               :placeholder="placeholder" value="value" :name="name"/>
        <button type="button" ref="button" class="icon fa-linkedin" @click="onLoginClick">Login</button>
        <!-- <script type="text/javascript" src="//platform.linkedin.com/in.js">
            api_key:   {
                {
                    api_key
                }
            }
            authorize: true
            lang:  {
                {
                    language
                }
            }
            onLoad: {
                {
                    onLoginClick
                }
            }
        </script> -->
    </div>
</template>

<script>
    export default {
        props: {
            value: {
                type: String
            },
            placeholder: {
                type: String,
                default: () => "Get your profile url"
            },
            name: {
                type: String,
                default: () => ''
            },
            api_key: {
                type: String,
                required: true
            },
            language: {
                type: String,
                required: true,
                default: () => 'en_US'
            }
        },
        computed: {
            authorized() {
                return IN && IN.User && IN.User.isAuthorized();
            }
        },
        methods: {
            onLoginClick() {
                var self = this;
                this.$refs.button.disabled = true;
                IN.User.authorize(function () {
                    self.$emit('logged_in');
                });
            },
            onLoggedIn() {
                var self = this;
                IN.API.Raw("/people/~:(public-profile-url)?format=json").result(function (data) {
                    self.value = data.publicProfileUrl;
                    self.$refs.button.disabled = false;
                }).error(function (err) {
                    self.value = '';
                    self.$refs.button.disabled = false;
                });
            }
        },
        mounted() {
            this.$on('logged_in', this.onLoggedIn);
        }
    };
</script>