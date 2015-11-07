var gulp = require('gulp');

var bower = require('gulp-bower');
gulp.task('bower', function() { 
  return bower()
  .pipe(gulp.dest('vendor/')) 
});

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var notify = require("gulp-notify");
gulp.task('browserify', function() {
  browserify('./sound-test.js')
    .bundle()
      .on('error', function(err) {
        return notify().write(err);
      })
      .pipe(source('app.js'))
      .pipe(gulp.dest('.'));
});

gulp.task('serve', ['bower', 'browserify'], function () {
    browserSync.init(null, {
        server: {
            baseDir: '.',
        },
        startPath: 'index.html',
        debugInfo: false,
        open: true,
        hostnameSuffix: ""
    });
});

var browserSync = require('browser-sync').create();
var reload = browserSync.reload;
gulp.task('watch', ['serve'], function () {
    gulp.watch(['*.html', 'app.js'], reload);
    gulp.watch(['sound-test.js'], ['browserify']);
});
