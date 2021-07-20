const { environment } = require('@rails/webpacker')
environment.loaders.delete('nodeModules')

const webpack = require('webpack')
environment.plugins.append('Provide', new webpack.ProvidePlugin({
    $: 'jquery',
    _: 'underscore'
}))

module.exports = environment
