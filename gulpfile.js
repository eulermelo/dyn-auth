// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var jshint = require('gulp-jshint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var karma = require('karma').Server;

var config = {
    source: 'src',
    targetPath: 'dist',
    targetName: 'dyn-auth'
};

// Lint Task
gulp.task('lint', function() {
    return gulp.src(config.source + '/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src([
            config.source + '/*.module.js',
            config.source + '/*.js'
        ])
        .pipe(concat(config.targetName + '.js'))
        .pipe(gulp.dest(config.targetPath))
        .pipe(rename(config.targetName + '.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.targetPath));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('/*.js', ['lint', 'scripts']);
});

gulp.task('test', ['scripts'], function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function() {
        done();
    });
});

// Default Task
gulp.task('default', ['lint', 'scripts', 'test']);

// Build Task
gulp.task('build', ['lint', 'scripts']);
