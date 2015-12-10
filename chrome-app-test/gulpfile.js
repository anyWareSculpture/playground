var path = require('path');
var os = require('os');

var gulp = require('gulp');
var shell = require('gulp-shell');
var zip = require('gulp-zip');

gulp.task('default', function(callback) {
  return runSequence('package', callback);
});

gulp.task('package', ['build'], function packageTask() {
  return gulp.src('build/**/*')
        .pipe(zip('chrome-app-test.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function collectStatic() {
  return gulp.src(['manifest.json', '*.html', '*.css', '*.js', '*.png'])
    .pipe(gulp.dest('build'));
});


var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome' : '');
gulp.task('launch', shell.task([
  browser + ' --load-and-launch-app=$PWD/build'
]));

gulp.task('watch', ['build'], function watch() {
  gulp.watch(['manifest.json', '*.html', '*.css', '*.js', '*.png'], ['build']);
});
