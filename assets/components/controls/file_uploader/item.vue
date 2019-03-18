<template>
    <div class="item" :style="style">
        <a v-if="can_remove" @click="onRemove"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
        <loading ref="loading"/>
        <div v-if="resize_mode" style="display: none;">
            <canvas ref="resized_canvas" :width="max_width" :height="max_height"></canvas>
            <img ref="original_img" src="file" @load="onOriginalImageLoad"/>
        </div>
    </div>
</template>

<script>
    export default {
        data: () => {
            preview_img: ''
            real_width: 0
            real_height: 0
            resize_mode: false
        },
        components: {
            loading: require('./control.vue').default
        },
        props: {
            type: {
                type: String,
                required: true
            },
            file: {
                type: String,
                required: true
            },
            source: {
                type: Object,
                required: false,
                validator(value) {
                    return (value === null) || (value instanceof File);
                }
            },
            name: {
                type: String,
                required: true
            }
        },
        computed: {
            style() {
                return "background-image: url('" + this.preview_img + "');";
            },
            can_remove() {
                return !this.$refs.loading.loading;
            },
            max_width() {
                return this.$el.offsetWidth;
            },
            max_height() {
                return this.$el.offsetHeight;
            }
        },
        watch: {
            file(new_file) {
                this.updatePreview();
            },
            resize_mode(new_value) {
                this.$refs.loading.loading = new_value;
            },
            source(file) {
                if (file instanceof File) {
                    this.resize_mode = true;

                    var reader = new FileReader();
                    var self = this;
                    reader.onload = function () {
                        self.file = reader.result;
                        self.type = file.type;
                        self.source = null;
                    };
                    reader.readAsDataURL(file);
                }
            }
        },
        methods: {
            onRemove() {
                this.$emit('remove', this);
            },
            updatePreview() {
                this.resize_mode = true;

                var self = this;

                /* pica.WW = true;
                 pica.WEBGL = true;
                 pica.resizeCanvas(
                     this.$refs.original_img,
                     this.$refs.resized_canvas,
                     {
                         quality: 3,
                         alpha: false,
                         unsharpAmount: 75,
                         unsharpRadius: 1.0,
                         unsharpThreshold: 0
                     }, function (err) {
                         self.preview_img = self.$refs.resized_canvas.toDataURL();
                         self.resize_mode = false;
                     });*/
            }
        }
    }
</script>