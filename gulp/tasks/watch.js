module.exports = function () {
    $.gulp.task('watch', function () {
        $.gulp.watch('src/static/pages/**/*.html', $.gulp.series('pages'))
        $.gulp.watch('src/static/less/**/*.less', $.gulp.series('less'))
        $.gulp.watch('src/static/js/**/*.js', $.gulp.series('scripts'))
    })
}