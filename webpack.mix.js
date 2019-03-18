const Path = require('path');

require('laravel-mix')
    .babelConfig({
        "plugins": [
            "@babel/plugin-syntax-dynamic-import"
        ]
    })
    .webpackConfig((webpack) => {
        return {
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
            },
            plugins: [
                new webpack.DefinePlugin({
                    LAST_BUILD_TIME: Date.now()
                })
            ]
        };
    })
    .js('assets/js/main.js', 'main.js')
    .setPublicPath('compiled')
    .copy('index.html', 'compiled/index.html')
    .extend('serveDev', new class {
        name() {
            return 'serveDev';
        }

        register(port) {
            if (!process.argv.includes('--watch')) {
                return;
            }
            var express = require("express");
            this.app = express();
            this.app.use(
                express.static('./compiled/')
            );
            let self = this;
            this.server = this.app.listen(port, function () {
                var port = self.server.address().port;
                console.log("Server started at http://localhost:%s", port);
            });
        }
    })
    .serveDev(3000);