'use strict';

global.$ = {
    gulp: require('gulp'),
    gp: require('gulp-load-plugins')(),
    browserSync: require('browser-sync').create(),
    path: {
        tasks: require('./gulp/config/tasks.js')
    }
}

$.path.tasks.forEach(function (taskPath) {
    require(taskPath)()
})

$.gulp.task('default', $.gulp.series(
    $.gulp.parallel('pages', 'less', 'scripts', 'svg', 'fonts'),
    $.gulp.parallel('watch', 'browser-sync')
))