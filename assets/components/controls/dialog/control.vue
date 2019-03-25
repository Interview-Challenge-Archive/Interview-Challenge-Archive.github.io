<template>
    <dialog @close="onClose" @cancel="onCancel">
        <h2>
            <a class="closer" @click="onCloseButtonClick" href="#" tabIndex="-1" aria-hidden="true"></a>
            <i v-if="this.type == DialogType.INFO" class="fa fa-info-circle" aria-hidden="true"></i>
            <i v-if="this.type == DialogType.ERROR" class="fa fa-exclamation-circle" aria-hidden="true"></i>
            {{title}}
        </h2>
        <div class="content">
            <form method="dialog">
                <div class="content">
                    {{html}}
                </div>
                <div class="buttons">
                    <span v-for="button in buttons">
                        <button v-if="button == ButtonType.OK" :name="field_action" value="ok" type="submit">OK</button>
                        <button v-if="button == ButtonType.CANCEL" :name="field_action" value="cancel" type="submit">Cancel</button>
                    </span>
                </div>
            </form>
        </div>
    </dialog>
</template>

<script>
    import Enum from "es6-enum";

    const DialogType = Enum('INFO', 'ERROR', 'CUSTOM');
    const ButtonType = Enum('OK', 'CANCEL');

    export default {
        props: {
            field_action: {
                type: String,
                required: true,
                default: () => '__action'
            },
            title: {
                type: String,
                default() {
                    return '';
                }
            },
            type: {
                type: DialogType,
                default() {
                    return DialogType.INFO;
                }
            },
            buttons: {
                type: Array,
                default() {
                    return [
                        ButtonType.OK
                    ]
                }
            },
            html: {
                type: String,
                required: true
            }
        },
        computed: {
            value() {
                return this.$el.returnValue;
            },
            isOpened() {
                return this.$el.open;
            }
        },
        methods: {
            onCloseButtonClick(e) {
                e.preventDefault();
                this.$el.close();
            },
            onCancel(e) {
                this.$emit('done', true);
            },
            onClose(e) {
                this.$emit('done', false);
            },
            invoke(title, message, buttons, method) {
                var self = this;
                if (title) {
                    this.title = title;
                }
                if (message) {
                    this.html = message;
                }
                return new Promise(function (resolve, reject) {
                    self.$once('done', function (canceled) {
                        if (canceled) {
                            reject();
                        } else {
                            resolve(self.value);
                        }
                    });
                    self.$el[method]();
                });
            },
            show(title, message, buttons) {
                return this.invoke(title, message, buttons, 'show');
            },
            showModal(title, message, buttons) {
                return this.invoke(title, message, buttons, 'showModal');
            },
            confirm(title, message) {
                return this.showModal(title, message, [ButtonType.OK, ButtonType.CANCEL]);
            }
        }
    };
</script>