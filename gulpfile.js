var gulp = require("gulp");
var clean = require("gulp-clean");
var cleancss = require("gulp-clean-css");
var stripeCssComments = require("gulp-strip-css-comments");
var uglify = require("gulp-uglify");
var gulpSequence = require("gulp-sequence");
var directoryMap = require("gulp-directory-map");
var beautify = require("gulp-beautify");
var concat = require("gulp-concat");
var runSequence = require('run-sequence');
var del = require("del");

// gulp.task("build", gulpSequence("directoryMap"));
// gulp.task("build-dist", ["move-html", "move-js", "move-dist-dep-js", "build-dist-dep-css", "move-view-css"]);
gulp.task("build-dist", function(){
  runSequence("del-public", "move-html", "move-js", "move-dist-dep-js", "build-dist-dep-css", "move-view-css", "copy-image");
});
gulp.task("build-dev", ["move-dev-dep-js", "build-dev-css"]);

gulp.task("move-dev-dep-js", function() {
  return gulp.src([
      "./node_modules/angular/angular.min.js",
      "./node_modules/angular-route/angular-route.min.js",
      "./node_modules/jquery/dist/jquery.min.js",
      "./node_modules/tether/dist/js/tether.min.js",
      "./node_modules/bootstrap/dist/js/bootstrap.min.js",
      "./node_modules/intl/dist/Intl.min.js",
      "./node_modules/intl/locale-data/jsonp/en.js",
      "./node_modules/intl/locale-data/jsonp/zh.js",
      "./node_modules/angularfire/dist/angularfire.min.js",
      "./node_modules/firebase/firebase.js"
    ])
    .pipe(gulp.dest("./dev/lib/scripts/"));
});

gulp.task("build-dev-css", function() {
  return gulp.src([
      "./node_modules/tether/dist/css/tether.min.css",
      "./node_modules/bootstrap/dist/css/bootstrap.min.css",
      "./node_modules/font-awesome/css/font-awesome.min.css"
    ])
    .pipe(concat("project.css"))
    .pipe(gulp.dest("./dev/lib/stylesheets/"));
});

gulp.task("move-view-css", function() {
  return gulp.src("./dev/main.css")
    .pipe(gulp.dest("./public/"));
});

gulp.task("move-html", function() {
  return gulp.src("./dev/**/*.html")
    .pipe(gulp.dest("./public/"));
});

gulp.task("move-js", function(){
  return gulp.src("./dev/**/*.js")
    // .pipe(uglify())
    .pipe(gulp.dest("./public/"));
});

gulp.task("move-dist-dep-js", function() {
  return gulp.src([
      "./node_modules/angular/angular.min.js",
      "./node_modules/angular-route/angular-route.min.js",
      "./node_modules/jquery/dist/jquery.min.js",
      "./node_modules/tether/dist/js/tether.min.js",
      "./node_modules/bootstrap/dist/js/bootstrap.min.js",
      "./node_modules/intl/dist/Intl.min.js",
      "./node_modules/intl/locale-data/jsonp/en.js",
      "./node_modules/intl/locale-data/jsonp/zh.js",
      "./node_modules/angularfire/dist/angularfire.min.js",
      "./node_modules/firebase/firebase.js"
    ])
    .pipe(gulp.dest("./public/lib/scripts/"));
});

gulp.task("build-dist-dep-css", function() {
  return gulp.src([
      "./node_modules/tether/dist/css/tether.min.css",
      "./node_modules/bootstrap/dist/css/bootstrap.min.css",
      "./node_modules/font-awesome/css/font-awesome.min.css"
    ])
    .pipe(concat("project.css"))
    .pipe(gulp.dest("./public/lib/stylesheets/"));
});

gulp.task("copy-image", function(){
  return gulp.src("./dev/image")
    .pipe(gulp.dest("./public/image"));
});

gulp.task("del-public", function() {
  del(["./public/*"]);
});
