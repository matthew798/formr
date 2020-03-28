/* eslint-disable */

const path = require('path');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const fs = require('fs');
const _ = require('lodash');

const plugins = {};

for (const plugin of fs.readdirSync(path.resolve(__dirname, './src/js/plugins'))) {
    if (plugin.indexOf(".Plugin.ts") > 0)
        plugins[plugin.substring(0, plugin.indexOf(".Plugin.ts"))] = path.resolve(__dirname, './src/js/plugins/', plugin);
}

const globalConfig = {
    output: {
        libraryTarget: "umd"
    },
    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [".js", ".ts", ".tsx"]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                use: ["source-map-loader"],
                enforce: "pre"
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader'
            }
        ],

    },
    plugins: [
        new SpriteLoaderPlugin(),
        new LodashModuleReplacementPlugin()
    ]
};

module.exports = [
    function (env, argv) {
        const prod = argv.mode === 'production';
        const devtool = prod ? false : "source-map";

        return _.merge(globalConfig, {
            entry: path.resolve(__dirname, './src/js/Index.ts'),
            output: {
                filename: 'formr.bundle.js',
                path: path.resolve(__dirname, `dist/${argv.mode === 'production' ? 'prod' : 'dev'}/js/`),
                library: 'Formr'
            },
            devtool: devtool,
            mode: argv.mode
        });
    },
    function (env, argv) {
        const prod = argv.mode === 'production';
        const devtool = prod ? false : "source-map";

        return _.merge(globalConfig, {
            entry: plugins,
            output: {
                filename: 'formr.[name].js',
                path: path.resolve(__dirname, `dist/${argv.mode === 'production' ? 'prod' : 'dev'}/js/plugins`),
                library: 'FormrPlugins'
            },
            devtool: devtool,
            mode: argv.mode
        });
    }
];