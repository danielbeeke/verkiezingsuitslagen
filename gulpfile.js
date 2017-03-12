'use strict';

var gulp = require('gulp');
var requireDir = require('require-dir');
var browserSync = require('browser-sync').create();

process.setMaxListeners(0);

global.paths = {
    'html': './frontend/**/*.html',
    'scss': './frontend/scss/**/*.scss',
    'css': './frontend/css',
    'js': ['./frontend/**/*.js', '!./frontend/lib'],
    'src': './frontend'
};

global.browserSync = browserSync;

requireDir('./gulp', { recurse: false });
gulp.task('default', ['serve']);