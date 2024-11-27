module.exports = function () {
    $.gulp.task('browser-sync', function () {
        $.browserSync.init({
            server: {
                baseDir: "./build",
                middleware: function (req, res, next) {
                    if (req.url.indexOf('/static/') === -1 && !req.url.endsWith('.html')) {
                        req.url = '/index.html'
                    }
                    next()
                }
            }
        })
    })
}