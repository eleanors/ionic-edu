module.exports = function(ctx) {
  var fs = ctx.requireCordovaModule('fs'),
    path = ctx.requireCordovaModule('path'),
    shell = ctx.requireCordovaModule("shelljs"),
    gulp = require('gulp'),
    UglifyJS = require('uglify-js'),
    CleanCSS = require('clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    htmlMinify = require('html-minifier').minify,
    cssOptions = {
      keepSpecialComments: 0
    },
    cssMinifier = new CleanCSS(cssOptions),

    rootDir = ctx.opts.projectRoot,
    platformPath = path.join(rootDir, 'platforms'),
    platforms = ctx.opts.cordova.platforms,
    platform = platforms.length ? platforms[0] : '',
    cliCommand = ctx.cmdLine,

    debug = true, //false

    htmlOptions = {
      removeAttributeQuotes: true,
      minifyJS: true,
      minifyCSS: cssOptions,
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      removeEmptyAttributes: true
    },

    successCounter = 0,
    errorCounter = 0,
    notProcessedCounter = 0,
    pendingCounter = 0,

    hasStartedProcessing = false,
    processRoot = false,
    isBrowserify = (cliCommand.indexOf('--browserify') > -1), //added
    //isRelease = true;
    isRelease = (cliCommand.indexOf('--release') > -1); // comment the above line and uncomment this line to turn the hook on only for release


  function processFiles(dir, _noRecursive) {
    fs.readdir(dir, function(err, list) {
      if (err) {
        // console.error('processFiles - reading directories error: ' + err);
        return;
      }
      list.forEach(function(file) {
        file = path.join(dir, file);
        fs.stat(file, function(err, stat) {
          hasStartedProcessing = true;
          if (stat.isDirectory()) {
            if (!_noRecursive) processFiles(file);
          } else {
            compress(file);
          }
        });
      });
    });
  }

  function processFile(file) {
    fs.stat(file, function(err, stat) {
      hasStartedProcessing = true;
      compress(file);
    });
  }

  function compress(file) {
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
      case '.js':
        (debug) && console.log('Compressing/Uglifying JS File: ' + file);
        var result = UglifyJS.minify(file, {
          compress: {
            dead_code: true,
            loops: true,
            if_return: true,
            keep_fargs: true,
            keep_fnames: true
          }
        });
        if (!result || !result.code || result.code.length == 0) {
          errorCounter++;
          console.error('\x1b[31mEncountered an error minifying a file: %s\x1b[0m', file);
        } else {
          successCounter++;
          fs.writeFileSync(file, result.code, 'utf8');
          (debug) && console.log('Optimized: ' + file);
        }
        break;
      case '.css':
        (debug) && console.log('Minifying CSS File: ' + file);
        var source = fs.readFileSync(file, 'utf8');
        if (!source || source.length == 0) {
          errorCounter++;
          console.error('Encountered an empty file: ' + file);
        } else {
          var result = cssMinifier.minify(source).styles;
          if (!result || result.length == 0) {
            errorCounter++;
            console.error('\x1b[31mEncountered an error minifying a file: %s\x1b[0m', file);
          } else {
            successCounter++;
            fs.writeFileSync(file, result, 'utf8');
            (debug) && console.log('Optimized: ' + file);
          }
        }
        break;
      case '.html':
        (debug) && console.log('Minifying HTML File: ' + file);
        var source = fs.readFileSync(file, 'utf8');
        if (!source || source.length == 0) {
          errorCounter++;
          console.error('Encountered an empty file: ' + file);
        } else {
          var result = htmlMinify(source, htmlOptions);
          if (!result || result.length == 0) {
            errorCounter++;
            console.error('\x1b[31mEncountered an error minifying a file: %s\x1b[0m', file);
          } else {
            successCounter++;
            fs.writeFileSync(file, result, 'utf8');
            (debug) && console.log('Optimized: ' + file);
          }
        }
        break;
      default:
        console.error('Encountered file with ' + ext + ' extension - not compressing.');
        notProcessedCounter++;
        break;
    }
  }

  function checkIfFinished() {
    if (hasStartedProcessing && pendingCounter == 0) console.log('\x1b[36m%s %s %s\x1b[0m', successCounter + (successCounter == 1 ? ' file ' : ' files ') + 'minified.', errorCounter + (errorCounter == 1 ? ' file ' : ' files ') + 'had errors.', notProcessedCounter + (notProcessedCounter == 1 ? ' file was ' : ' files were ') + 'not processed.');
    else setTimeout(checkIfFinished, 10);
  }


  switch (platform) {
    case 'android':
      platformPath = path.join(platformPath, platform, "assets", "www");

      shell.cp('-Rf', path.join(rootDir, 'config/CordovaActivity.java'), path.join(platformPath, '../../CordovaLib/src/org/apache/cordova/'));
      shell.cp('-Rf', path.join(rootDir, 'google-services.json'), path.join(platformPath, '../../'));
      shell.sed('-i', 'Theme.DeviceDefault.NoActionBar', 'Theme.NoTitleBar.Fullscreen', path.join(platformPath, '../../AndroidManifest.xml'));
      shell.sed('-i', /<string name="app_name">.*<\/string>/, '<string name="app_name">秦学云课堂学生</string>', path.join(platformPath, '../../res/values/strings.xml'));
      break;
    case 'ios':
      platformPath = path.join(platformPath, platform, "www");
      shell.rm('-rf', path.join(platformPath, '../cache'));
      shell.mkdir('-p', path.join(platformPath, '../cache'));
      shell.cp('-Rf', path.join(platformPath, 'bootstarp/*'), path.join(platformPath, '../cache/bootstarp/'));

      shell.mv('-f', path.join(platformPath, 'dist/*'), path.join(platformPath, '../cache/'));
      shell.cp('-Rf', path.join(platformPath, 'cordova.js'), path.join(platformPath, '../cache/'));

      shell.rm('-rf', path.join(platformPath, '/*'));
      shell.cp('-Rf', path.join(platformPath, '../cache/*'), path.join(platformPath, '../www'));
      shell.rm('-rf', path.join(platformPath, '../cache'));
      break;
    default:
      console.error('Hook currently supports only Android and iOS');
      return;
  }

  if (isBrowserify) {
        shell.rm('-rf', path.join(platformPath, 'cordova-js-src'));  
        shell.rm('-rf', path.join(platformPath, 'plugins'));  
        shell.rm('-f', path.join(platformPath, 'cordova_plugins.js'));
  }

  if (!isRelease) {
    return;
  }

  console.log('cordova-minify STARTING - minifying your js, css, html. Sit back and relax!');


  //minify files inside these directories
  //var foldersToProcess = ['javascript', 'style', 'js', 'css', 'html'];
  var foldersToProcess = isBrowserify ? [] : ['cordova-js-src', 'plugins'];

  if (processRoot) processFiles(platformPath, true);

  foldersToProcess.forEach(function(folder) {
    processFiles(path.join(platformPath, folder));
  });

  //minify files one by one
  var filesToProcess = ['cordova.js'];
  if (!isBrowserify) filesToProcess.push('cordova_plugins.js');

  filesToProcess.forEach(function(file) {
    processFile(path.join(platformPath, file));
  });

  checkIfFinished();

  gulp.src(platformPath + '/template.html')
    .pipe(rename('index.html'))
    .pipe(gulp.dest(platformPath));
};
