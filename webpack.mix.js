var mix = require('laravel-mix');
var readdir = require( 'recursive-readdir-sync');
var path = require( 'path');

function readdir_multiple(dirs) {
    var rez = [];
    for (var o = 0; o < dirs.length; o++) {
        try {
            var files = readdir(__dirname + "/" + dirs[o]);
            for(var i = 0; i < files.length; i++) {
                var ext = path.extname(files[i]).toLowerCase();
                if (ext == '.js' || ext == '.jsx' || ext == '.vue') {
                    rez.push(files[i]);
                }
            }
        } catch(err){
            // skip bad path
        }
    }
    return rez;
};

var js_files = readdir_multiple(["assets/js", "assets/components"]);

console.log('Found Javascript/Vue files:');
if (js_files.length == 0) {
    console.log(' - (no files found)');
} else {
    for(var i = 0; i < js_files.length; i++) {
        console.log(' - ' + js_files[i]);
    }
    mix.js(js_files, 'compiled/scripts.js');
}

mix.extract([
    'vue',
    'dialog-polyfill',
    'js-base64',
    'console-polyfill',
    'js-sha1',
    'pica',
    'hellojs',
    'clipboard',
    'skel',
    'es6-enum',
    'i18next'
], 'compiled/vendor.js');

mix.sass(__dirname + '/assets/sass/main.scss', 'compiled/main.css');
mix.sass(__dirname + '/assets/sass/ie8.scss', 'compiled/ie8.css');
mix.sass(__dirname + '/assets/sass/ie9.scss', 'compiled/ie9.css');