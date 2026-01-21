const { defineConfig } = require('@vue/cli-service')
const WebpackObfuscator = require('webpack-obfuscator');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = defineConfig({
    productionSourceMap: false,
    transpileDependencies: true,
    lintOnSave: false,
    publicPath: './',
    devServer:{
        https: false,
        proxy: {
            '/login': {
                target: 'http://127.0.0.1:3007',
            },
            '/api': {
                target: 'http://127.0.0.1:3007',
            },
        }
    },
    configureWebpack: (config) => {
        if (process.env.NODE_ENV === 'production') {
            // 加密與混淆
            config.plugins.push(
                new WebpackObfuscator(
                {
                    rotateUnicodeArray: true,
                    compact: true,
                    selfDefending: true
                },
                ['js/chunk-vendors*.js']
                )
            );

            // 壓縮
            config.optimization.minimizer.push(
                new TerserPlugin({
                terserOptions: {
                    extractComments: false,
                    compress: {
                        drop_console: true,
                        drop_debugger: true
                    }
                }
                })
            );

            // Tree shaking
            config.optimization.usedExports = true;

            // 拆分代碼
            config.optimization.splitChunks = {
                chunks: 'all',
                minSize: 80000,
                maxSize: 0,
                minChunks: 2,
                maxAsyncRequests: 20,
                maxInitialRequests: 8,
                enforceSizeThreshold: 150000,
                automaticNameDelimiter: '~',
            };
        }
    }
})