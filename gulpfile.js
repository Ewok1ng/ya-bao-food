const argv = require('yargs').argv;
const fs = require('node:fs');
const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const gulpif = require('gulp-if');
const { htmlValidator } = require('gulp-w3c-html-validator');
const connect = require('gulp-connect');
const del = require('del');
const webpack = require('webpack-stream');
const babel = require('gulp-babel');
const ghPages = require('gulp-gh-pages');

const srcFonts = './src/scss/_fonts.scss';
const appFonts = './src/fonts/';

function validateHtml() {
    return gulp
        .src('src/pages/*.html')
        .pipe(gulpif(argv.prod, htmlValidator.analyzer()))
        .pipe(gulpif(argv.prod, htmlValidator.reporter()))
        .pipe(gulp.dest('dist'))
        .pipe(gulpif(!argv.prod, connect.reload()));
}

function styles() {
    return gulp
        .src('src/scss/style.scss')
        .pipe(gulpif(!argv.prod, sourcemaps.init()))
        .pipe(scss())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ['last 4 version'],
                cascade: false,
            }),
        )
        .pipe(gulpif(argv.prod, cleanCSS({ level: 2 })))
        .pipe(gulpif(!argv.prod, sourcemaps.write()))
        .pipe(gulp.dest('dist/css'))
        .pipe(gulpif(!argv.prod, connect.reload()));
}

function scripts() {
    return gulp
        .src('src/js/*.js')
        .pipe(
            babel({
                presets: ['@babel/env'],
            }),
        )
        .pipe(webpack(require('./webpack.config.js')))
        .pipe(gulp.dest('dist/js'))
        .pipe(gulpif(!argv.prod, connect.reload()));
}

function images() {
    return gulp
        .src('src/images/**/*')
        .pipe(
            gulpif(
                argv.prod,
                imagemin([
                    imagemin.gifsicle({ interlaced: true }),
                    imagemin.mozjpeg({ quality: 75, progressive: true }),
                    imagemin.optipng({ optimizationLevel: 5 }),
                    imagemin.svgo({
                        plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
                    }),
                ]),
            ),
        )
        .pipe(gulp.dest('dist/images'))
        .pipe(gulpif(!argv.prod, connect.reload()));
}

function fonts() {
    return gulp.src('src/fonts/**/*.*').pipe(gulp.dest('dist/fonts/'));
}

function transformFonts() {
    gulp.src(['src/fonts/*.ttf']).pipe(ttf2woff()).pipe(gulp.dest('src/fonts/'));
    return gulp.src(['src/fonts/*.ttf']).pipe(ttf2woff2()).pipe(gulp.dest('src/fonts'));
}

function fontsStyle(done) {
    fs.writeFile(srcFonts, '', () => {});
    fs.readdir(appFonts, (err, items) => {
        if (items) {
            let c_fontname;
            for (let i = 0; i < items.length; i++) {
                let fontname = items[i].split('.')[0];
                if (c_fontname != fontname) {
                    let [fontfamily, fontweight] = fontname.split('-');
                    fs.appendFile(
                        srcFonts,
                        `@include font-face("${fontfamily}", "${fontname}", 400, normal);\r\n`,
                        () => {},
                    );
                }
                c_fontname = fontname;
            }
        }
    });
    done();
}

function watcher() {
    gulp.watch('src/pages/**/*.html', validateHtml);
    gulp.watch('src/scss/**/*.scss', styles);
    gulp.watch('src/js/**/*.js', scripts);
    gulp.watch('src/images/**/*.*', images);
    gulp.watch('src/fonts/**/*.*', fonts);
}

function server() {
    return connect.server({
        host: '0.0.0.0',
        port: 8080,
        root: 'dist/',
        livereload: true,
    });
}

function clean(cb) {
    return del('dist').then(() => cb());
}

function deploy() {
    return gulp.src('./dist/**/*').pipe(ghPages());
}

const dev = gulp.series(validateHtml, styles, scripts, images, fonts);

exports.default = gulp.parallel(watcher, gulp.series(clean, dev, server));
exports.convertfonts = gulp.series(transformFonts, fontsStyle);
exports.build = gulp.series(clean, dev);
exports.deploy = gulp.series(clean, dev, deploy);
