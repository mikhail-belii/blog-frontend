module.exports = function () {
    $.gulp.task('scripts', function () {
        return $.gulp.src('src/static/js/*.js')
        .pipe($.gulp.dest('build/static/js/'))
        .pipe($.browserSync.reload({
            stream: true
        }))
    })
}