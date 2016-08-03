'use strict'

const path = require('path')
const extend = require('util')._extend;

const argv = require('yargs').argv;
const babel = require('gulp-babel')
const browserify = require('browserify')
const buffer = require('vinyl-buffer')
const cleanCSS = require('gulp-clean-css')
const concat = require('gulp-concat')
const fs = require('fs')
const gulp = require('gulp-help')(require('gulp'), {})
const gutil = require('gulp-util')
const ifElse = require('gulp-if-else')
const livereload = require('gulp-livereload')
const nodemon = require('gulp-nodemon')
const notify = require('gulp-notify')

const rename = require('gulp-rename')
const sass = require('gulp-sass')
const size = require('gulp-size')
const source = require('vinyl-source-stream')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

const NODE_ENV = process.env.NODE_ENV || 'development'
const NODE_PATH = process.env.NODE_PATH || path.join(__dirname, 'node_modules')

const deployMode = argv.production ? argv.production : (process.env.NODE_ENV === 'production');
if (deployMode) {
    gutil.log('Running gulp optimized for deployment...');
}

let isWatcher = false
// Default options for filesize stats.
let sizeOptions = {showTotal: true, showFiles: true};
let paths = {
    src: {
        fonts: [
            path.join(NODE_PATH, 'roboto-fontface', 'fonts', 'roboto', 'Roboto-Regular.woff2'),
            path.join(NODE_PATH, 'garage11-icons', 'font', '*.woff'),
        ],
    },
    target: {
        fonts: path.join(__dirname, 'public', 'font'),
    },
}


gulp.task('app-js', 'Process all application Javascript.', () => {
    let b = browserify({entries: './garage11.js', debug: !deployMode})
    b.ignore('ractive')
    b.ignore('lodash')
    b.ignore('underscore')
    b.ignore('winston')
    b.ignore('crypto')
    b.ignore('buffer')

    return b.bundle()
    .pipe(source('garage11.js'))
    .pipe(buffer())
    .pipe(ifElse(!deployMode, function() {
        return sourcemaps.init({loadMaps: true})
    }))
    .pipe(ifElse(!deployMode, sourcemaps.write))
    // Es6 issues.
    // .pipe(ifElse(deployMode, uglify))
    .on('error', notify.onError('Error: <%= error.message %>'))
    .pipe(gulp.dest('./public/js/'))
    .pipe(size(extend({title: 'app-js'}, sizeOptions)))
})


gulp.task('vendor-js', (done) => {
    let b = browserify({entries: './lib/vendor.js', debug: !deployMode})

    return b.bundle()
    .pipe(source('./lib/vendor.js'))
    .pipe(buffer())
    .pipe(ifElse(!deployMode, function() {
        return sourcemaps.init({loadMaps: true})
    }))
    .pipe(ifElse(!deployMode, sourcemaps.write))
    .pipe(babel({compact: true, presets: ['es2015']}))
    .pipe(uglify())
    .pipe(rename(function(filepath) {
        filepath.dirname = filepath.dirname.replace('lib', '');
    }))
    .pipe(gulp.dest('./public/js/'))
    .pipe(size(extend({title: 'vendor-js'}, sizeOptions)))
    .pipe(ifElse(isWatcher, livereload))
})


gulp.task('scss', 'Find all scss files from the apps directory, concat them and save as one css file.', () => {
    gulp.src('./apps/**/styles.scss')
    .pipe(sass({includePaths: NODE_PATH}))
    .on('error', notify.onError('Error: <%= error.message %>'))
    .pipe(concat('styles.css'))
    .pipe(ifElse(deployMode, () => cleanCSS({
        // This is a CPU-hungry option, use with care.
        advanced: true,
    })))
    .pipe(gulp.dest('./public/css'))
    .pipe(size(extend({title: 'scss'}, sizeOptions)))
    .pipe(ifElse(isWatcher, livereload))
})


gulp.task('assets-fonts', 'Process all font assets.', (done) => {
    return gulp.src(paths.src.fonts)
    .pipe(gulp.dest(paths.target.fonts))
    .pipe(size(extend({title: 'assets-fonts'}, sizeOptions)))
});


gulp.task('develop', 'Start a development server and watch for changes.', () => {
    isWatcher = true
    nodemon({
        script: 'index.js',
        ext: 'js html',
        env: {'NODE_ENV': NODE_ENV},
        // This will leave stdin to nesh.
        restartable: false,
    })
    .on('restart', () => {
        livereload.changed('index.js')
    })

    // Start livereload server on https using existing key pairs.
    fs.readFile('./public.pem', 'ascii', (err, publicKey) => {
        if(err) console.log(err)
        fs.readFile('./private.pem', 'ascii', (_err, privateKey) => {
            if(_err) console.log(_err)
            livereload.listen({cert: publicKey, key: privateKey, silent: false})
        })
    })

    gulp.watch([
        path.join(__dirname, 'garage11.js'),
        path.join(__dirname, 'apps', '**', '*.js'),
        path.join(__dirname, 'lib', '*.js'),
        path.join('!', __dirname, 'lib', 'vendor.js'),
        path.join(NODE_PATH, 'lib11', 'index.js'),
        path.join(NODE_PATH, 'lib11', 'lib', '**', '*.js'),
        path.join(NODE_PATH, 'lib11', 'lib', 'thirdparty.js'),
        path.join(NODE_PATH, 'garage11-db-adapter', 'index.js'),
    ], () => {
        gulp.start('app-js')
    })

    gulp.watch([
        path.join(__dirname, 'lib', 'vendor.js'),
        path.join(NODE_PATH, 'lib11', 'lib', 'thirdparty.js'),
    ], () => {
        gulp.start('vendor-js')
    })

    gulp.watch([
        path.join(__dirname, 'apps', '**', 'scss', '*.scss'),
        path.join(NODE_PATH, 'garage11-icons', 'sass', '*.scss'),
    ], () => {
        gulp.start('scss')
    })
})


gulp.task('build', [
    'app-js',
    'vendor-js',
    'scss',
    'assets-fonts',
])
