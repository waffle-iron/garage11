'use strict'

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


gulp.task('browserify:app', () => {
    let b = browserify({entries: './garage11.js', debug: !isProduction})

    // Don't include these, they are either included seperately in
    // libs.js or are using another alternative (like native browser crypto).
    b.ignore('ractive')
    b.ignore('lodash')
    b.ignore('underscore')
    b.ignore('winston')
    b.ignore('crypto')
    // b.ignore('buffer')

    return b.bundle()
    .pipe(source('garage11.js'))
    .pipe(buffer())
    .pipe(ifElse(isProduction, uglify))
    .pipe(ifElse(!isProduction, () => {
        return sourcemaps.init({loadMaps: true})
    }))
    .pipe(ifElse(!isProduction, () => {
        return sourcemaps.write('./', {sourceRoot: './', includeContent: false})
    }))
    .pipe(gulp.dest('./public/js/'))
    .pipe(size())
})


gulp.task('browserify:libs', () => {
    let b = browserify({entries: './libs.js', debug: !isProduction})

    return b.bundle()
    .pipe(source('libs.js'))
    .pipe(buffer())
    .pipe(ifElse(isProduction, uglify))
    .pipe(gulp.dest('./public/js/'))
    .pipe(size())
})


gulp.task('browserify:js-data-rtc', () => {
    let b = browserify({entries: './node_modules/js-data-rtc/index.js', debug: !isProduction})

    return b.bundle()
    .pipe(source('js-data-rtc.min.js'))
    .pipe(buffer())
    .pipe(ifElse(isProduction, uglify))
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
        './node_modules/high5/lib/**/*.js',
        './node_modules/route11/**/*.js',
        '!./node_modules/high5/lib/thirdparty.js',
    ], () => {
        gulp.start('browserify:app')
    })

    gulp.watch([
        './libs.js',
        './node_modules/high5/lib/thirdparty.js',
    ], () => {
        gulp.start('browserify:libs')
    })

    // Third-party js-data adapter forged for Garage11 project.
    gulp.watch(['./node_modules/js-data-rtc/**.js'], () => {
        gulp.start('browserify:js-data-rtc')
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
    'browserify:app',
    'browserify:libs',
    'browserify:js-data-rtc',
    'scss',
])
