module.exports = function () {
    $.gulp.task('fonts', function () {
        return $.gulp.src('src/static/fonts/*.ttf')
        .pipe($.gulp.dest('build'))
        .on('end', $.browserSync.reload)
    })
}