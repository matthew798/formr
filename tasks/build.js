const webpack = require('webpack');
const sass = require('node-sass');
const path = require('path');
const fs = require('fs-extra');
const config = require('../webpack.config');
const util = require('util');

const __root = __dirname.substring(0, __dirname.lastIndexOf("/") + 1);
const __src = path.resolve(__root, 'src');
const __dist = path.resolve(__root, 'dist');
const __dev = path.resolve(__dist, 'dev');
const __prod = path.resolve(__dist, 'prod');
const __docs = path.resolve(__root, 'docs');

const mode = process.argv[2] === ('prod' || null) ? 'production' : 'development';
const prod = mode === 'production';

console.log(`Starting build in ${mode} mode`);

(async () => {
    //Create folder structure
    const tl = prod ? __prod : __dev;
    const paths = [tl, path.resolve(__dist, 'i18n'), path.resolve(__dist, 'theme'), path.resolve(tl, 'js'), path.resolve(tl, 'css')];

    for (const path of paths)
        if (!await fs.exists(path))
            await fs.mkdir(path);

    //Js compilation
    const compileTasks = [];

    for (const cfg of config)
        compileTasks.push(webpackCompileAsync(cfg(null, {mode: mode})));

    //SASS/SCSS
    const sassPify = util.promisify(sass.render);
    const sassPath = path.resolve(__src, 'sass');
    const sassTasks = [];

    for (const file of await fs.readdir(sassPath)) {
        const input = path.resolve(sassPath, file);
        const outDir = path.resolve(prod ? __prod : __dev, 'css');
        const outFile = path.resolve(outDir, file.substring(0, file.lastIndexOf('.')) + '.css');
        sassTasks.push(sassCompileAsync(input, outFile, {
            outputStyle: prod ? 'compressed' : 'nested',
            sourceMap: !prod
        }));
    }

    //JS compilation promises
    const results = await Promise.all(compileTasks);

    for (const stats of results) {
        if (stats.hasErrors())
            console.error(stats.toJson().errors);

        console.log(stats.toString());
    }


    //SASS compilation promises
    await Promise.all(sassTasks);

    //Files
    const copyTasks = [];

    copyTasks.push(copyAll(path.resolve(__src, 'js/i18n'), path.resolve(__dist, 'i18n'), /^[a-z,A-Z]{2}\.json$/));
    copyTasks.push(copyAll(path.resolve(__src, 'js/theme'), path.resolve(__dist, 'theme'), /^theme\..+\.json$/));

    if (mode === 'production') {
        const paths = [path.resolve(__docs, 'i18n'), path.resolve(__docs, 'theme'), path.resolve(__docs, 'js'), path.resolve(__docs, 'js/plugins'), path.resolve(__docs, 'css')];

        for (const path of paths)
            if (!await fs.exists(path))
                await fs.mkdir(path);

        copyTasks.push(copyAll(path.resolve(__prod, "js/"), path.resolve(__docs, "js/"), /bundle\.js$/));
        copyTasks.push(copyAll(path.resolve(__prod, "js/plugins"), path.resolve(__docs, "js/plugins"), /.*/));
        copyTasks.push(copyAll(path.resolve(__prod, "css/"), path.resolve(__docs, "css/"), /\.css$/));
        copyTasks.push(copyAll(path.resolve(__src, 'js/i18n'), path.resolve(__docs, 'i18n'), /^[a-z,A-Z]{2}\.json$/));
        copyTasks.push(copyAll(path.resolve(__src, 'js/theme'), path.resolve(__docs, 'theme'), /^theme\..+\.json$/));

    }

    await Promise.all(copyTasks);

    console.log("All done!");
})();

/**
 *
 * @param {String} src
 * @param {String} dest
 * @param {RegExp} [filter]
 * @returns {Promise<void>}
 */
async function copyAll(src, dest, filter) {
    console.log(`Copying files from ${src} to ${dest} ${filter ? "with regex" : ""}`);
    if (!(await fs.lstat(src)).isDirectory() || !(await fs.lstat(dest)).isDirectory())
        throw("Source or Destination is not a directory");

    if (!await fs.exists(src) || !await fs.exists(dest))
        throw("Source or Destination directory does not exist");

    const files = await fs.readdir(src);

    for (const file of files) {
        try {
            if (filter == null) {
                await fs.copyFile(path.resolve(src, file), path.resolve(dest, file));
            } else if (filter.test(file)) {
                await fs.copyFile(path.resolve(src, file), path.resolve(dest, file));
            }
        } catch (err) {
            console.error(`Failed to copy ${path.resolve(src, file)} to ${dest}. \n\t ${err}`)
        }
    }
}

function webpackCompileAsync(cfg) {
    return new Promise((resolve, reject) => {
        console.log(`Starting asynchronous build for ${cfg.entry}`);

        const compiler = webpack(cfg);

        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }

            resolve(stats);
        })
    })
}

async function sassCompileAsync(input, output, options) {
    if (input.substring(input.lastIndexOf('/') + 1, input.length)[0] === '_')
        return;

    const sassPify = util.promisify(sass.render);
    const cfg = Object.assign({file: input, outFile: output}, options);

    await sassPify(cfg)
        .then(async (result) => {
            await fs.writeFile(output, result.css);
        });
}