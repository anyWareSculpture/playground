var gulp = require('gulp');

var bower = require('gulp-bower');
gulp.task('bower', function() { 
  return bower()
  .pipe(gulp.dest('vendor/')) 
});

var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var notify = require("gulp-notify");
gulp.task('browserify', function() {
  browserify('./sound-test.js')
    .transform(babelify, {presets: ["es2015"]})
    .bundle()
      .on('error', function(err) {
        return notify().write(err);
      })
      .pipe(source('app.js'))
      .pipe(gulp.dest('build'));
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
    gulp.watch(['*.html', 'build/app.js'], reload);
    gulp.watch(['*.js'], ['browserify']);
});
