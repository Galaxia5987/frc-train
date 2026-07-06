const path = require('path');
const webpack = require('webpack');

module.exports = {
    mode: 'production',
    entry: './index.js',
    output: {
        filename: 'github-manager.bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'GHManager',
        libraryTarget: 'window' 
    },
    resolve: {
        fallback: {
            "fs": false,
            "path": false,
            "crypto": false
        }
    },
    plugins: [
        new webpack.NormalModuleReplacementPlugin(
            /^node:/,
            (resource) => {
                resource.request = resource.request.replace(/^node:/, '');
            }
        )
    ]
};