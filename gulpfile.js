'use strict'

let babel = require('gulp-babel')
let browserify = require('browserify')
let buffer = require('vinyl-buffer')
let concat = require('gulp-concat')
let fs = require('fs')
let gulp = require('gulp')
let ifElse = require('gulp-if-else')
let livereload = require('gulp-livereload')
let minifyCSS = require('gulp-minify-css')
let minimist = require('minimist')
let nodemon = require('gulp-nodemon')
let notify = require('gulp-notify')

let rename = require('gulp-rename')
let sass = require('gulp-sass')
let size = require('gulp-size')
let source = require('vinyl-source-stream')
let sourcemaps = require('gulp-sourcemaps')
let uglify = require('gulp-uglify')

let options = minimist(process.argv.slice(2), {
    default: { env: process.env.NODE_ENV || 'development' },
    string: 'env',
})

let isProduction = (options.env === 'production')
let isWatcher = false


gulp.task('app-js', () => {
    let b = browserify({entries: './garage11.js', debug: !isProduction})
    b.ignore('ractive')
    b.ignore('lodash')
    b.ignore('underscore')
    b.ignore('winston')
    b.ignore('crypto')
    b.ignore('buffer')

    return b.bundle()
    .pipe(source('garage11.js'))
    .pipe(buffer())
    .pipe(ifElse(!isProduction, sourcemaps.init))
    .pipe(ifElse(!isProduction, sourcemaps.write))
    // Es6 issues.
    // .pipe(ifElse(isProduction, uglify))
    .on('error', notify.onError('Error: <%= error.message %>'))
    .pipe(gulp.dest('./public/js/'))
    .pipe(size())
})


gulp.task('vendor-js', () => {
    let b = browserify({entries: './lib/vendor.js', debug: !isProduction})

    return b.bundle()
    .pipe(source('./lib/vendor.js'))
    .pipe(buffer())
    .pipe(babel({compact: true, presets: ['es2015']}))
    .pipe(uglify())
    .pipe(rename(function(filepath) {
        console.log(filepath)
        filepath.dirname = filepath.dirname.replace('lib', '');
    }))
    .pipe(gulp.dest('./public/js/'))
    .pipe(size())
})


gulp.task('scss', () => {
    gulp.src('./apps/**/styles.scss')
    .pipe(sass().on('error', notify.onError('Error: <%= error.message %>')))
    .pipe(concat('styles.css'))
    .pipe(ifElse(isProduction, minifyCSS))
    .pipe(gulp.dest('./public/css'))
    .pipe(size())
    .pipe(ifElse(isWatcher, livereload))
})


gulp.task('default', ['server:start'], () => {
    isWatcher = true

    // Start livereload server on https using existing key pairs.
    fs.readFile('./public.pem', 'ascii', (err, publicKey) => {
        if(err) {
            console.log(err)
        }
        fs.readFile('./private.pem', 'ascii', (_err, privateKey) => {
            if(_err) {
                console.log(_err)
            }
            livereload.listen({cert: publicKey, key: privateKey, silent: false})
        })
    })

    gulp.watch([
        './apps/views/**/*.js',
        './apps/components/**/*.js',
        './garage11.js',
        './lib/*.js',
        '!./lib/vendor.js',
        './node_modules/high5/index.js',
        './node_modules/high5/lib/**/*.js',
        '!./node_modules/high5/lib/thirdparty.js',
        './node_modules/js-data-high5/index.js',
    ], () => {
        gulp.start('app-js')
    })

    gulp.watch([
        './lib/vendor.js',
        './node_modules/high5/lib/thirdparty.js',
    ], () => {
        gulp.start('vendor-js')
    })

    gulp.watch(['./apps/**/scss/*.scss'], () => {
        gulp.start('scss')
    })
})


gulp.task( 'server:start', () => {
    nodemon({
        script: 'server.js',
        ext: 'js html',
        env: {'NODE_ENV': 'development'},
    })
    .on('restart', () => {
      livereload.changed('garage11.js')
    })
})


gulp.task('build', [
    'app-js',
    'vendor-js',
    'browserify:js-data-rtc',
    'scss',
])
