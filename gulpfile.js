//Gulp tools
var gulp = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var gulpIf = require('gulp-if');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var cache = require('gulp-cache');
//markup tools
// var handlebars = require('gulp-compile-handlebars'); //disabled for this task
//CSS and precompilers tools
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');
//JS tools
// var webpack = require('webpack-stream'); //disabled for this task
var uglify = require('gulp-uglify');
//image opt tools
var imagemin = require('gulp-imagemin');
//file manipulation tools
var del = require('del');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
//production tools
var zip = require('gulp-zip');
var argv = require('yargs').argv;


// Development Tasks
// -----------------

// Start browserSync server
gulp.task('browserSync', function() {
    browserSync({
        server: {
            baseDir: 'dist'
        }
    })
})

//disabled for this task
// gulp.task('handlebars', function () {
//     var templateData = {
//             firstName: 'Max'
//         },
//         options = {
//             ignorePartials: false, //ignores the unknown partials
//             batch : ['./src/partials'],
//             helpers : { //Helper sample, write your own js and call it in the html
//                 capitals : function(str){
//                     return str.toUpperCase();
//                 }
//             }
//         }
//     return gulp.src('src/pages/*.handlebars')
//         .pipe(handlebars(templateData, options))
//         .pipe(rename(function(path) {
//             path.extname = '.html';
//         }))
//         .pipe(gulp.dest('dist'))
//         .pipe(browserSync.reload({ // Reloading with Browser Sync
//             stream: true
//         }));
// })

gulp.task('html', function() {
    return gulp
        .src(['src/pages/*.html', 'src/partials/*.html' ]) // Gets all files HTML files
        .pipe(gulp.dest('dist/')) // Outputs it in the dist folder
        .pipe(browserSync.stream()); // Reloading with Browser Sync
})

gulp.task('sass', function() {
    return gulp.src('src/scss/styles.scss') // Gets all files ending with .scss in src/scss and children dirs
        .pipe(sass({ outputStyle: 'expanded' })
            .on('error', sass.logError))   // Passes it through a gulp-sass
        .pipe(concat('main.min.css')) // save as...
        .pipe(gulp.dest('dist/css')) // Outputs it in the css folder
        .pipe(browserSync.stream()); // Reloading with Browser Sync
})

gulp.task('sass-compile', function() {
    return gulp.src('src/scss/styles.scss') // Gets all files ending with .scss in src/scss and children dirs
        .pipe(sourcemaps.init()) // registers the sorurcemaps
        .pipe(sass({ outputStyle: 'compressed' })// Passes it through a gulp-sass
            .on('error', sass.logError))   // Passes it through a gulp-sass
        .pipe(concat('main.min.css')) // save as...
        .pipe(cssnano()) // minify
        .pipe(sourcemaps.write('.')) // write all the sourcemaps
        .pipe(gulp.dest('dist/css')) // Outputs it in the css folder
        .pipe(browserSync.reload({ // Reloading with Browser Sync
            stream: true
        }));
})

gulp.task('scripts', function() {
    gulp.src('src/js/*')
        // .pipe(concat('all.js'))
        // .pipe(uglify())
        .pipe(gulp.dest('dist/js/'))
        .pipe(browserSync.stream());
});

// Webpack disabled for this task
// gulp.task('webpack', function(callback) {
//     return gulp.src('src/js/scripts.js')
//         .pipe(webpack( require('./webpack.config.js') ))
//         .pipe(gulp.dest('dist/js/'))
//         .pipe(browserSync.reload({ // Reloading with Browser Sync
//             stream: true
//         }));
// })

// Copy
// ------------------
// Copying Bootstrap SASS files
gulp.task('copy_bootstrap', function () {
    return gulp
        .src('vendor/bootstrap/scss/**/*')
        .pipe(gulp.dest('src/scss/bootstrap'));
});
// Copying Fontawesome fonts
gulp.task('copy_fontawesome_fonts', function () {
    return gulp
        .src('vendor/fontawesome/fonts/**/*')
        .pipe(gulp.dest('src/assets/fonts/fontawesome'));
});
// Copying Fontawesome SASS
gulp.task('copy_fontawesome_sass', function () {
    return gulp
        .src('vendor/fontawesome/scss/**/*')
        .pipe(gulp.dest('src/scss/fontawesome'));
});
// Copying vendors JS
gulp.task('copy_vendor', function () {
    return gulp
        .src([
            'vendor/bootstrap/dist/js/bootstrap.min.js',
            'node_modules/tether/dist/js/tether.min.js',
            'vendor/angular/angular.min.js',
            'vendor/angular/angular.min.js.map',
            'vendor/angular-route/angular-route.min.js',
            'vendor/angular-route/angular-route.min.js.map',
            'vendor/angular-animate/angular-animate.min.js',
            'vendor/angular-animate/angular-animate.min.js.map',
            'vendor/angular-messages/angular-messages.min.js',
            'vendor/angular-messages/angular-messages.min.js.map',
            'vendor/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('dist/js/libs'))
});
// Copying fonts
gulp.task('fonts', function() {
    return gulp.src('src/assets/fonts/**/*')
        .pipe(gulp.dest('dist/assets/fonts'));
})
// Copying images
gulp.task('images', function() {
    return gulp.src('src/assets/images/**/*')
        .pipe(gulp.dest('dist/assets/images'))
})


// Watchers
// ------------------
gulp.task('watch', ['browserSync', 'sass', 'html'], function (){
    gulp.watch('src/scss/**/*.scss', ['sass']);
    gulp.watch('src/**/*.html', ['html']);
    gulp.watch('src/**/*.js', ['scripts']);
});


// Optimization Tasks
// ------------------

// Optimizing Images
gulp.task('imagemin', function() {
    return gulp.src('src/assets/images/**/*.+(png|jpg|jpeg|gif)')
    // Caching images that ran through imagemin
        .pipe(cache(imagemin({
            interlaced: true,
        })))
        .pipe(gulp.dest('dist/assets/images'))
});

// Cleaning
gulp.task('clean', function() {
    return del.sync('dist').then(function(cb) {
        return cache.clearAll(cb);
    });
})

gulp.task('clean:dist', function() {
    return del.sync(['dist/**/*', '!dist/images', '!dist/images/**/*']);
});

gulp.task('clean:bin', function() {
    return del.sync(['bin/**/*']);
})

// Build Sequences
// ---------------

gulp.task('run', function(callback) {
    runSequence(['build', 'browserSync', 'watch'],
        callback
    )
})

gulp.task('build', function(callback) {
    runSequence(
        'clean:dist',
        ['copy_bootstrap','copy_fontawesome_fonts', 'copy_fontawesome_sass','fonts', 'copy_vendor','images' ,'imagemin', 'scripts'],
        'html',
        'sass',
        callback
    )
})

// example task for the CI, teamcity will run gulp run first and then gulp pack
gulp.task('pack', ['clean:bin'], function()  {
    return gulp.src('**/*', { cwd:'dist/', expand: true })
        .pipe(zip('MSL-max.' + argv.build + '.zip'))
        .pipe(gulp.dest('./bin'));
});