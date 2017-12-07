var paths = require('path');
var fs = require('fs');
var through = require('through2');

var gulp = require('gulp');
var sass = require('gulp-sass');

var shell = require("shelljs");
var cleanCss = require('gulp-clean-css');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');

var es = require('event-stream');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var ngAnnotate = require('gulp-ng-annotate');
var templateCache = require('gulp-angular-templatecache');
var gulpSequence = require('gulp-sequence');
var cssBase64 = require('gulp-css-base64');

var source = require('./www/source.json');

// gulp后资源存放地址
var path = {
    js: './www/dist/js/', //'./www/dist/js/'
    css: './www/dist/css/',
    images: './www/dist/img/',
    lib: './www/dist/lib/',
    fonts: './www/dist/lib/ionic/fonts/',
    destinations: './www/dist'
}

// Ionic SCSS编译
gulp.task('ionic-scss', function(done) {
    gulp.src(source.scss[0])
        .pipe(sass())
        .pipe(gulp.dest('./www/css'))
        .pipe(cleanCss({
            keepSpecialComments: 0
        }))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest('./www/css'))
        .on('end', done);
});

// 项目SCSS编译
gulp.task('app-scss', function(done) {
    gulp.src(source.scss[1])
        .pipe(sass())
        .pipe(concat('style.css'))
        .pipe(gulp.dest('./www/css'))
        .on('end', done);
});

gulp.task('watch', ['ionic-scss', 'app-scss'], function() {
    //gulp.watch(source.scss[0], ['ionic-scss']);
    gulp.watch(source.scss[1], ['app-scss']);

    //gulp.watch(source.js, []);
    //gulp.watch(source.template, []);
});


// 第三方 JS资源
gulp.task('vendor', function() {
  gulp.src(source.vendorJS)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(path.js))
    .pipe(uglify())
    .pipe(rename('vendor.min.js'))
    .pipe(gulp.dest(path.js));
});

gulp.task('math', function() {
  gulp.src(source.mathjax)
    .pipe(gulp.dest(path.lib+'/mathjax'))
});

// 项目 JS
gulp.task('js', function() {
    return es.merge(gulp.src(source.js), getTemplateStream())
        .pipe(ngAnnotate())
        .pipe(fixPath({
            baseDir: '../',
            rule: /img\/\w+\-?\w+.png/g
        }))
        .pipe(concat('app.js'))
        .pipe(gulp.dest(path.js))
        .pipe(uglify())
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest(path.js));
});

// 项目 CSS 压缩 图片转base64
gulp.task('css', function() {
    gulp.src(source.css)
        .pipe(concat('style.css'))
        .pipe(minifyCss())
        .pipe(cssBase64({
            maxWeightResource: 300000,
            extensionsAllowed: ['.png', '.jpg']
        }))
        .pipe(gulp.dest(path.css));
});

// Ionic|Videoangular的字体
gulp.task('fonts', function() {

    gulp.src(source.fonts[0])
        .pipe(gulp.dest(path.fonts));
    gulp.src(source.fonts[1])
        .pipe(gulp.dest(path.css + 'fonts'));
    gulp.src(source.photoswipe)
        .pipe(gulp.dest(path.css));
});

// 剩余文件
gulp.task('reset', function() {
    source.reset.forEach(function(value, key) {
        if (value.indexOf('.png') > -1) {
            gulp.src(value)
                .pipe(gulp.dest(path.images));
        } else {
            gulp.src(value)
                .pipe(gulp.dest(path.destinations));
        }
    })
});

// CSS|JS文件注入模板
gulp.task('inject', function() {
    gulp.src('./www/template.html')
        .pipe(inject(gulp.src('./www/dist/js/vendor.min.js', { read: false }), { ignorePath: 'dist/', relative: true, starttag: '<!-- inject:head:{{ext}} -->' }))
        .pipe(inject(gulp.src(['./www/dist/js/app.min.js'], { read: false }), { ignorePath: 'dist/', relative: true }))
        .pipe(inject(gulp.src('./www/dist/css/style.css', { read: false }), { ignorePath: 'dist/', relative: true }))
        .pipe(rename('index.html'))
        .pipe(gulp.dest(path.destinations));
});

// CSS|JS文件注入模板
gulp.task('dists', function() {
    var platformPath = paths.join(__dirname, 'www');
    console.log(platformPath);
    shell.rm('-rf', paths.join(platformPath, '../cache'));
    shell.mv('-f', paths.join(platformPath, '../www'), paths.join(platformPath, '../cache'));
    shell.mkdir('-p', paths.join(platformPath, '../www'));
    shell.cp('-Rf', paths.join(platformPath, '../cache/dist/*'), paths.join(platformPath, '../www/'));
    shell.cp('-Rf', paths.join(platformPath, '../cache/bootstarp'), paths.join(platformPath, '../www/'));

    // shell.mv('-f', paths.join(platformPath, '../cache'), paths.join(platformPath, '../www/'));
    shell.rm('-rf', paths.join(platformPath, '../cache'));

    shell.sed('-i', 'com.qxclass.student', 'com.qxcloud.student', paths.join(platformPath, '../config.xml'));
});

// html文件转换为 angular 模板
var getTemplateStream = function() {
    return gulp.src(source.template)

        .pipe(templateCache({
            root: 'templates/',
            module: 'starter'
        }))
}

gulp.task('dev', ['watch']);

gulp.task('prod', gulpSequence('vendor', 'ionic-scss', 'app-scss', 'css', 'js', 'fonts', 'reset', 'inject'));


function fixPath(options) {
    var opts = options || {};
    var rule = opts.rule || /url\([^\)]+\)/g;
    var baseDir = opts.baseDir || '.';

    return through.obj(function(file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streaming not supported'));
            return cb();
        }

        var content = file.contents.toString();
        var images = content.match(rule);

        images = ['img/blank.png', 'img/load-error.png', 'img/avatar-man.png', 'img/avatar-woman.png', 'img/broken.png'];

        images && images.forEach(function(item) {
            imageURL = item.replace(/\(|\)|\'/g, '');
            imageURL = imageURL.replace(/^url/g, '');

            //content = content.replace(RegExp(item, 'g'), baseDir+imageURL);
            content = content.replace(RegExp(item, 'g'), './' + item);
        });
        file.contents = new Buffer(content);
        this.push(file);
        cb();
    })
}
