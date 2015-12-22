var path = require('path');
var os = require('os');

var gulp = require('gulp');
var shell = require('gulp-shell');
var zip = require('gulp-zip');
var browserSync = require('browser-sync').create();
var notify = require("gulp-notify");
var source = require('vinyl-source-stream');
var reload = browserSync.reload;

/*
  Takes a browserify stream as input and produces a bundled output build/bundle.js
*/
var buffer = require('vinyl-buffer');
var debug = require('gulp-debug');
function bundleApp(b) {
  return b.bundle()
         .on('error', function(err) {
           return notify().write(err);
         })
         .pipe(source('bundle.js'))
         .pipe(buffer())
         .pipe(debug({title: 'A'}))
         .pipe(gulp.dest('./build'))
         .pipe(notify("Build app done!"))
         .pipe(browserSync.reload({stream: true, once: true}));
}

/*
  Creates a browserified stream of the given files and calls the passed bundle function.a
  if watch is true, will automatically watch and rebuild using the passed bundle function.

  The bundle function must take a stream as parameter and produce the appropriate output.
*/
var browserify = require('browserify');
var watchify = require('watchify');
var babelify = require('babelify');
function createBrowserifiedStream(files, watch, bundle) {
  var b = browserify({entries: files,
                      debug: true
                     })
    .transform('babelify', {
      presets: ['es2015'],
      plugins: [require('babel-plugin-transform-class-properties')]
    });
  
  if (watch) {
    var w = watchify(b, {ignoreWatch: false});
    w.on('update', function() {
      console.log("Updating...");
      return bundle(b);
    });
  }
  return bundle(b);
}

gulp.task('default', function(callback) {
  return runSequence('package', callback);
});

var browserify_files = ['src/app.js'];
gulp.task('browserify-nowatch', function() {
  return createBrowserifiedStream(browserify_files, false, bundleApp);
});

gulp.task('browserify-watch', function() {
  return createBrowserifiedStream(browserify_files, true, bundleApp);
});

gulp.task('build', ['build-static', 'browserify-nowatch'], function packageTask() {
  return gulp.src('build/**/*')
        .pipe(zip('chrome-serial-test.zip'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-static', function collectStatic() {
  return gulp.src(['manifest.json', '*.html', '*.css', '*.js', '*.png'])
         .pipe(gulp.dest('build'));
});

var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? '/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome' : '');
gulp.task('launch', shell.task([
  browser + ' --load-and-launch-app=$PWD/build'
]));

gulp.task('watch', ['build-static', 'browserify-watch'], function watch() {
  gulp.watch(['manifest.json', '*.html', '*.css', '*.js', '*.png'], ['build-static']);
});
