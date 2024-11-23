module.exports = function () {
    $.gulp.task('svg', function () {
        return $.gulp.src('src/static/img/**/*')
        .pipe($.gulp.dest('build/static/img/'))
    })
}