module.exports = function () {
    $.gulp.task('pages', function () {
        return $.gulp.src('src/static/pages/*.html')
        .pipe($.gulp.dest('build'))
        .on('end', $.browserSync.reload)
    })
}