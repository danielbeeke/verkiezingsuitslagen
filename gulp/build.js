'use strict';

var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('build', ['css'], function () {

    exec('jspm bundle verkiezingsuitslagen/app dist/build.js --minify', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
    });

    gulp.src('./frontend/*.html')
    .pipe(gulp.dest('./dist'));

    gulp.src('./frontend/jspm.config.js')
    .pipe(gulp.dest('./dist'));

    gulp.src(['./frontend/es6-shim.js', './frontend/shims_for_IE.js'])
    .pipe(gulp.dest('./dist'));


    gulp.src('./frontend/lib/*')
    .pipe(gulp.dest('./dist/lib'));
    gulp.src('./frontend/css/*')
    .pipe(gulp.dest('./dist/css'));
});
