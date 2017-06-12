<template>
    <div>
        <input type="file" ref="uploader" :name="hiddenInputFileFieldName" :accept="accept" :multiple="multiple"
               @change="onFileSelectionChanged"/>
        <dialog ref="dialog"></dialog>
        <div v-if="empty" class="empty">
            {{placeholder}}
        </div>
        <div v-if="!empty">
            <item v-for="(file, index) in files" v-key="index" :name="name" :source="file.source" :file="file.file"
                  :type="file.type" @remove="onRemoveItem"></item>
        </div>
    </div>
</template>

<style scoped>
    input[type="file"] {
        display: none;
    }
</style>

<script>
    export default {
        components: {
            items: require(__dirname + '/item.vue')
        },
        data: () => {
            _files: []
        },
        props: {
            name: {
                type: String,
                required: true
            },
            accept: {
                type: String
            },
            multiple: {
                type: Boolean,
                default: () => false
            },
            placeholder: {
                type: String
            }
        },
        computed: {
            hiddenInputFileFieldName: () => '__file__' + this.name,
            empty: () => this._files.length == 0,
            files: {
                set(files) {
                    this._files.length = 0;
                    for (var i = 0; i < files.length; i++) {
                        this._files.push({
                            file: files[i],
                            type: 'unknown/unknown',
                            source: null
                        });
                    }
                },
                get () {
                    return this._files.map(
                        (el) => el.file
                    ).filter(
                        (el) => !!el
                    );
                }
            }
        },
        methods: {
            onFileSelectionChanged(e) {
                if (!this.multiple) {
                    this._files.length = 0; // clear array
                }
                for (var i = 0; i < e.target.files.length; i++) {
                    this._files.push({
                        file: '',
                        type: 'unknown/unknown',
                        source: e.target.files[i]
                    });
                }
            },
            onRemoveItem(item) {
                var self = this;
                this.$refs.dialog.confirm('Remove file?', 'Do you want to remove this file from upload?').then(function (ret) {
                    self.removeItemByParam('file', item.file);
                });
            },
            showDialog() {
                this.$refs.uploader.click();
            },
            removeItemByParam(param, value) {
                this._files = this._files.filter(
                    (el) => el[param] == value
                );
            }
        }
    }
</script>