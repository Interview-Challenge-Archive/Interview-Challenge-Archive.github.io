/**
 * Created by mekdr on 1/11/2017.
 */

Image.prototype.toDataURL = function (format, quality) {
    if (!format) {
        format = 'image/png';
    }
    if (!quality) {
        quality = 0.71;
    }
    var canvas = $('<canvas></canvas>');
    canvas.attr('width', this.naturalWidth);
    canvas.attr('height', this.naturalHeight);
    canvas.get(0).getContext('2d').drawImage(this, 0, 0);

    return canvas.get(0).toDataURL(format, quality);
};