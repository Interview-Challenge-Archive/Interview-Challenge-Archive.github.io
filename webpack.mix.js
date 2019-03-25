const Path = require('path');
const FS = require('fs');
const YAML = require('yaml');

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
                    '@': Path.join(__dirname, 'assets')
                }
            },
            module: {
                rules: [
                    {
                        test: /\.(yaml|yml)$/,
                        exclude: /(node_modules)/,
                        loader: 'yml-loader'
                    },
                ],
            },
            plugins: [
                new webpack.DefinePlugin({
                    LAST_BUILD_TIME: JSON.stringify(
                        Date.now()
                    ),
                    APP_CONFIG: JSON.stringify(
                        {
                            github: {
                                token: '5af35c8e574c9791150f70dcba5166429768df77',
                                user: 'MekDrop',
                                client: {
                                    id: 'bad45375ab68d3570283',
                                    secret: '839d2e580a2f89622e3de4b143e8df6c9b75ef74'
                                },
                                oauth: {
                                    application_callback_url: 'https://jobtestvault.github.io'
                                }
                            },
                            db: {
                                host: 'ds145168.mlab.com',
                                port: 45168,
                                name: 'job_test_vault',
                                username: 'ANpJXRNJ7jFs6jjh',
                                password: '~#-wFC7?#FU$u(g7'
                            }
                        }
                    ),
                    PANELS_INFO: JSON.stringify(
                        FS.readdirSync("./assets/components/panels")
                            .map(item => Path.join('./assets/components/panels/', item))
                            .filter(item => FS.lstatSync(item).isDirectory())
                            .map(item => {
                                let module = YAML.parse(
                                    FS.readFileSync(
                                        Path.resolve(
                                            Path.join(item, 'config.yaml')
                                        ),
                                        'utf8'
                                    )
                                );
                                return {
                                    iconClass: module.iconClass,
                                    title: Path.basename(item),
                                    component: Path.join('..', item + '/control.vue')
                                }
                            })
                    ),
                    LANGUAGES_DATA: JSON.stringify(
                        FS.readdirSync("./assets/lang")
                            .map(item => Path.join("./assets/lang", item))
                            .filter(item => FS.lstatSync(item).isDirectory())
                            .map(item => Object.assign(
                                {},
                                YAML.parse(
                                    FS.readFileSync(
                                        Path.resolve(
                                            Path.join(item, 'config.yaml')
                                        ),
                                        'utf8'
                                    )
                                ),
                                {
                                    locale: Path.basename(item)
                                }
                                )
                            )
                    )
                })
            ]
        };
    })
    .js('assets/js/main.js', 'main.js')
    .sass('assets/sass/main.scss', 'main.css')
    .setPublicPath('compiled')
    .copy('index.html', 'compiled/index.html')
    .copyDirectory('node_modules/flag-icon-css/flags/1x1/', 'compiled/flags/')
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