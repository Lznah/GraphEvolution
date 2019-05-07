'use strict';

var gulp     = require('gulp'),
    sass     = require('gulp-sass'),
    electron = require('electron-connect').server.create();

// You should also add a 'clean' task to clean the dist folder
// I removed it because it is not needed in this example

// Copy third party libraries from /node_modules into /vendor
gulp.task('vendor', function() {

  // Bootstrap
  gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'));

  // jQuery
  gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));

  // jQuery Easing
  gulp.src([
      'node_modules/jquery.easing/*.js'
    ])
    .pipe(gulp.dest('./vendor/jquery-easing'));

});

gulp.task('serve', function () {
  electron.start();
  gulp.watch(['app/scss/*.sass','app/**/*.html','app/**/*.js'], gulp.series('styles', reload)); // <-- The trick is here, you need to create function with the done callback
  gulp.watch('app/index.html', gulp.series('styles', reload)); // <-- The trick is here, you need to create function with the done callback
  // Here are some more examples in case you're not sure:
  //gulp.watch('app/**/*.pug', gulp.series('views', reload));
  //gulp.watch('app/**/*.ts', gulp.series('scripts', reload));
});

// See? Simple.
function reload(done) {
  electron.reload();
  done();
}

gulp.task('styles', function() {
  return gulp.src('./app/scss/*.sass') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(sass())
    .pipe(gulp.dest('./app/css'));
});

gulp.task('default', gulp.series('styles', 'serve'));
