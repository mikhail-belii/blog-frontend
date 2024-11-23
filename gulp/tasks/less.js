module.exports = function () {
    $.gulp.task('less', function () {
        return $.gulp.src('src/static/less/*.less')
        .pipe($.gp.sourcemaps.init())
        .pipe($.gp.less({}))
        .pipe($.gp.autoprefixer())
        .on("error", $.gp.notify.onError({
            title: 'less'
        }))
        .pipe($.gp.csso())
        .pipe($.gp.sourcemaps.write())
        .pipe($.gulp.dest('build/static/css/'))
        .pipe($.browserSync.reload({
            stream: true
        }))
    })
}