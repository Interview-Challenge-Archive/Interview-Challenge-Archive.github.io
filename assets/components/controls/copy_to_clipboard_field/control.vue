<template>
    <div class="field multiple">
        <input type="text" readonly :value="value" :id="input_id">
        <button class="icon fa-copy" :data-clipboard-target="input_target" ref="button">
            Copy
        </button>
    </div>
</template>

<script>
    import Clipboard from 'clipboard';

    export default {
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
                window.jobtestvault.showInfoDialog('Clipboard', 'The link was copied to the clipboard!', true);
                e.clearSelection();
            });

            this.clipboard.on('error', function (e) {
                window.jobtestvault.showErrorDialog('Clipboard', "Your browser doesn't support copy to clipboard command. Try to use manual shortcuts!", true);
            });
        }
    }
</script>