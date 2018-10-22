const fs = require('fs')
const path = require('path')
const mix = require('laravel-mix')
const config = {
    publicPath: 'public',
    publicModulesPath: 'modules',
    publicMediaPath: 'media',
    modulesPath: 'app/Modules',
    entryFilename: 'module',
    jsPath: 'Resources/js',
    scssPath: 'Resources/sass',
    mediaPath: 'Resources/media'
}
const setters = {
    publicPath: nval => config.publicPath = nval,
    publicModulesPath: nval => config.publicModulesPath = nval,
    modulesPath: nval => config.modulesPath = nval,
    entryFilename: nval => config.entryFilename = nval,
    jsPath: nval => config.jsPath = nval,
    scssPath: nval => config.scssPath = nval,
    mediaPath: nval => config.mediaPath = nval
}

const getters = {
    publicPath: () => config.publicPath,
    modulesPath: () => config.modulesPath,
    entryFilename: () => config.entryFilename,
    jsPath: () => config.jsPath,
    scssPath: () => config.scssPath,
    mediaPath: () => config.mediaPath,
    config: () => config
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
                                console.log('|-------------------- BUILDING --------------------|')
                                console.log(path)
                                console.log('|--------------------------------------------------|')
                                if (!/node_modules|bower_components/.test(path)) {
                                    let modulename = path
                                        .split(config.modulesPath)
                                        .pop()
                                        .replace(/^(\/*).*?/i, '')
                                        .split('/')
                                        .shift()
                                        .toLowerCase()
                                        .replace(/^(_*).*?/i, '')
                                    return (
                                        config.publicModulesPath + '/' + modulename + '/' + config.publicMediaPath + '/[name].[ext]'
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
            let moduleOutputPath = path.join(config.publicPath, config.publicModulesPath, module.display.toLowerCase())

            // Compile javascript files
            let jsIn = path.join(module.path, config.jsPath, config.entryFilename + '.js')
            let jsOut = path.join(moduleOutputPath, module.display.toLowerCase() + '.js')
            if (fs.existsSync(jsIn)) {
                mix.js(jsIn, jsOut)
            }

            // Compile sass files
            let scssIn = path.join(module.path, config.scssPath, config.entryFilename + '.scss')
            let scssOut = path.join(moduleOutputPath, module.display.toLowerCase() + '.css')

            if (fs.existsSync(scssIn)) {
                mix.sass(scssIn, scssOut)
            }

            // Media files
            let mediaIn = path.join(module.path, config.mediaPath, 'static')
            let mediaOut = path.join(moduleOutputPath, config.publicMediaPath, 'static')

            if (fs.existsSync(mediaIn)) {
                mix.copy(mediaIn, mediaOut)
            }
        })
    }
}
