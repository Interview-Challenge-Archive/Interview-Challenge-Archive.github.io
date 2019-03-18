const Path = require('path');

require('laravel-mix')
    .babelConfig({
        "plugins": [
            "@babel/plugin-syntax-dynamic-import"
        ]
    })
    .webpackConfig({
        resolve: {
            extensions: [
                '.js',
                '.css',
                '.vue',
                '.json',
                '.scss'
            ],
            alias: {
                '~': Path.join(__dirname, 'node_modules'),
                '@': Path.join(__dirname, 'components')
            }
        }
    })
    .js('assets/js/main.js', 'main.js')
    .setPublicPath('compiled');