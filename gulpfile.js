const {src, dest, watch, parallel, series } = require('gulp');
const scss           = require('gulp-sass')(require('sass'));
const concat         = require('gulp-concat');
const browserSync    = require('browser-sync').create();
const uglify         = require('gulp-uglify-es').default;
const autoprefixer   = require('gulp-autoprefixer');
const imagemin       = require('gulp-imagemin');
const del            = require('del');

// (reload real-time browser)
function browsersync() {
   browserSync.init({
      server: {
         baseDir: 'app/'
      }
   });
}

// clean dist before save changes
function cleanDist(){
   return del('dist')
}

// compress image
function images() {
   return src('app/img/**/*')
   .pipe(imagemin(
      [
         imagemin.gifsicle({ interlaced: true }),
         imagemin.mozjpeg({ quality: 75, progressive: true }),
         imagemin.optipng({ optimizationLevel: 5 }),
         imagemin.svgo({
            plugins: [
               { removeViewBox: true },
               { cleanupIDs: false }
            ]
         })
      ]
   ))
   .pipe(dest('dist/img'))
}


// (соеденяет и минимизирует JS)
function scripts() {
   return src([
         'node_modules/jquery/dist/jquery.js',
         'node_modules/slick-carousel/slick/slick.js',
         'node_modules/mixitup/dist/mixitup.js',
         'node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js',
         // 'app/js/slick.js',
         // 'app/js/.......',
         // 'app/js/.......',
         // 'app/js/.......',
         'app/js/main.js',
      ])
      .pipe(concat('main.min.js'))
      .pipe(uglify())
      .pipe(dest('app/js'))
      .pipe(browserSync.stream())
}

// (соеденяет и минимизирует scss/ sass) 
// остальные файлы scss через  @import
function styles() {
   return src('app/scss/style.scss')
      .pipe(scss({
         outputStyle: 'compressed'
      }))
      .pipe(concat('style.min.css'))
      .pipe(autoprefixer({
         overrideBrowserslist: ['last 10 version'],
         grid: 'autoplace'
      }))
      .pipe(dest('app/css'))
      .pipe(browserSync.stream())
}

// переност файлов в родной каталог
function build() {
   return src([
         'app/css/style.min.css',
         'app/fonts/**/*',
         'app/js/main.min.js',
         'app/*.html'
         // 'app/img/**/*'   ЭТО ДЕЛАЕМ ПРИ СЖАТИИ. gulp images
      ], {
         base: 'app'
      })
      .pipe(dest('dist'))
}

// (следит за изменениями в файлах)
function watching() {
   watch(['app/scss/**/*.scss'], styles);
   watch(['app/js/**/*.js', '!app/js/main.min.js'], scripts);
   watch(['app/*.html']).on('change', browserSync.reload);
}

// exports функций
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
// exports.build = build;
exports.cleanDist = cleanDist;
exports.images = images;


// позволяет одновременно запуститьотслеживание нескольких функций 
exports.default = parallel(styles, build, scripts, browsersync, watching);

// cthbz lkz 
exports.build = series(cleanDist, images, build );