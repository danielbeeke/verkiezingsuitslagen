'use strict';

var gulp = require('gulp');
var reload = global.browserSync.reload;
var nodemon = require('gulp-nodemon');

gulp.task('serve', ['css', 'nodemon'], function () {
    global.browserSync.init({
        server: {
            baseDir: global.paths.src
        },
        ghostMode: false
    });

    gulp.watch([global.paths.html, global.paths.js]).on("change", reload);
    gulp.watch([global.paths.scss], ['css'])
});

gulp.task('nodemon', function (cb) {
    var started = false;

    return nodemon({
        script: 'backend/api.js'
    }).on('start', function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});
