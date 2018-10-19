const path = require('path')
const fs = require('fs')
const mix = require('laravel-mix')
const setters = {
    publicPath: (nval) => config.publicPath = nval,
    modulesPath: (nval) => config.modulesPath = nval,
    entryFilename: (nval) => config.entryFilename = nval,
    jsPath: (nval) => config.jsPath = nval,
    scssPath: (nval) => config.scssPath = nval
}

const getters = {
    publicPath: () => config.publicPath,
    modulesPath: () => config.modulesPath,
    entryFilename: () => config.entryFilename,
    jsPath: () => config.jsPath,
    scssPath: () => config.scssPath,
    config: () => config
}

let config = {
    publicPath: 'public/modules',
    modulesPath: 'app/Modules/',
    entryFilename: 'module',
    jsPath: 'Resources/js',
    scssPath: 'Resources/sass'
}

mix.webpackConfig({
    module: {
        rules: [
            {
                test: /(\.(png|jpe?g|gif)$|^((?!font).)*\.svg$)/,
                loaders: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: path => {
                                if (!/node_modules|bower_components/.test(path)) {
                                    let modulename = path
                                        .split(config.modulesPath)
                                        .pop()
                                        .split('/')
                                        .shift()
                                        .toLowerCase()
                                        .replace(/^(_*).*?/i, '')
                                    return (
                                        'modules/' + modulename + '/media/[name].[ext]?[hash]'
                                    );
                                }

                                return (
                                    Config.fileLoaderDirs.images +
                                    '/vendor/' +
                                    path
                                        .replace(/\\/g, '/')
                                        .replace(
                                            /((.*(node_modules|bower_components))|images|image|img|assets)\//g,
                                            ''
                                        ) +
                                    '?[hash]'
                                );
                            },
                            publicPath: Config.resourceRoot
                        }
                    },

                    {
                        loader: 'img-loader',
                        options: Config.imgLoaderOptions
                    }
                ]
            }
        ]
    }
})




module.exports = {
    set: setters,
    get: getters,
    build: () => {
        let modules = []
        fs.readdirSync(config.modulesPath).forEach(result => {
            let path = config.modulesPath + '/' + result
            if (fs.lstatSync(path).isDirectory()) {
                modules.push({
                    name: result,
                    display: result.replace('_', ''),
                    path: path.replace('//', '/')
                })
            }
        })

        modules.forEach(module => {
            let _public = config.publicPath
            let moduleOutputPath = config.publicPath + '/' + module.display.toLowerCase() + '/'

            let jsIn = module.path + '/' + config.jsPath + '/' + config.entryFilename + '.js'
            let jsOut = moduleOutputPath + module.display.toLowerCase() + '.js'
            if (fs.existsSync(jsIn)) {
                mix.js(jsIn, jsOut)
            }

            let scssIn = module.path + '/' + config.scssPath + '/' + config.entryFilename + '.scss'
            let scssOut = moduleOutputPath + module.display.toLowerCase() + '.css'

            if (fs.existsSync(scssIn)) {
                mix.sass(scssIn, scssOut)
            }
            mix.setResourceRoot(_public)
        })
    }
}
