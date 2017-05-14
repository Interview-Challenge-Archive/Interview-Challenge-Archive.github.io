<template>
    <div class="field multiple">
        <input type="text" readonly :value="value" :id="input_id">
        <button class="icon fa-copy" :data-clipboard-target="input_target" ref="button">
            Copy
        </button>
        <dialog ref="dialog"></dialog>
    </div>
</template>

<script>
    import Clipboard from 'clipboard';

    export default {
        components: {
            dialog: require(__dirname + '/../dialog/control.vue')
        },
        data() {
            return {
                input_id: 'copy_to_clipboard_' + Math.random().toString(36).substring(7),
                clipboard: null
            }
        },
        props: {
            value: {
                type: String,
                default() {
                    return '';
                }
            }
        },
        computed: {
            input_target() {
                return '#' + input_id;
            }
        },
        mounted() {
            this.clipboard = new Clipboard(this.$refs.button);

            this.clipboard.on('success', function (e) {
                this.$refs.dialog.showModal('Clipboard', 'The link was copied to the clipboard!');
                e.clearSelection();
            });

            this.clipboard.on('error', function (e) {
                this.$refs.dialog.showModal('Clipboard', 'The link was copied to the clipboard!');
                window.jobtestvault.showErrorDialog('Clipboard', "Your browser doesn't support copy to clipboard command. Try to use manual shortcuts!", true);
            });
        }
    }
</script>