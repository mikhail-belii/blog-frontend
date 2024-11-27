module.exports = function () {
    $.gulp.task('browser-sync', function () {
        $.browserSync.init({
            server: {
                baseDir: "./build",
                middleware: function (req, res, next) {
                    if (!req.url.includes('/static/') && !req.url.includes('.') && req.url !== '/') {
                        req.url = '/index.html';
                    }
                    next();
                }
            }
        })
    })
}