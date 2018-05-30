var gulp = require("gulp");
var gulpif = require("gulp-if");
var gutil = require("gulp-util");
var pkg = require("./package.json");
var compile = require("./task/compile");
var babel = require("gulp-babel");
var template = require("gulp-template");
var jshint = require("gulp-jshint");
var argv = require("yargs").argv;
var jsdoc = require("gulp-jsdoc3");
var clean = require("gulp-clean");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var deploy = require("gulp-gh-pages");
var replace = require("gulp-replace");
var concat = require("gulp-concat");
var plumber = require("gulp-plumber");
var header = require("gulp-header");
var bump = require("gulp-bump");

var karma = require("karma");
var karmaConfig = require.resolve("./conf/karma.conf");

var banner = [
    "/**",
    " * <%= name %>: <%= description %>",
    " * @version <%= version %> <%= new Date().toUTCString() %>",
    " * @link <%= homepage %>",
    " * @copyright <%= new Date().getFullYear() %> <%= author %>",
    " * @license <%= license %>",
    " */"
].join("\n");

if (process.env.npm_package_version) {
    pkg.version = process.env.npm_package_version;
}

gulp.task("lint-test", function() {
    return gulp.src(["test/spec/**/*.js"])
        .pipe(jshint(require("./conf/jshintrc-test")))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(gulpif(process.env.TRAVIS_JOB_NUMBER, jshint.reporter("fail")));
});

gulp.task("compile", function() {
    return gulp.src(["**/*.js"], {cwd: "./src"})
        .pipe(gulpif(!process.env.TRAVIS_JOB_NUMBER, plumber()))
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(jshint.reporter("fail"))
        .pipe(compile("better-dom.js", pkg))
        .pipe(babel())
        .pipe(header(banner + "\n", pkg))
        .pipe(gulp.dest("build/"));
});

gulp.task("test", ["compile", "lint-test"], function(done) {
    var config = {preprocessors: []};

    if (process.env.TRAVIS_JOB_NUMBER) {
        config = {
            reporters: ["coverage", "dots", "coveralls"],
            coverageReporter: {
                type: "lcovonly",
                dir: "coverage/"
            }
        };
    }

    config.configFile = karmaConfig;

    new karma.Server(config, function(resultCode) {
        done(resultCode ? new gutil.PluginError("karma", "Tests failed") : null);
    }).start();
});

gulp.task("browsers", ["compile", "lint-test"], function(done) {
    var config = {preprocessors: []};

    if (argv.ie10 || argv.ie11) {
        config.browsers = ["IE" + (argv.ie10 ? "10" : "11") + " - Win7"];
    } else {
        config.browsers = ["Chrome", "Safari", "Firefox"];
    }

    config.configFile = karmaConfig;

    new karma.Server(config, function(resultCode) {
        done(resultCode ? new gutil.PluginError("karma", "Tests failed") : null);
    }).start();
});

gulp.task("dev", ["compile", "lint-test"], function() {
    gulp.watch(["src/**/*.js"], ["compile"]);
    gulp.watch(["test/spec/**/*.js"], ["lint-test"]);

    new karma.Server({
        configFile: karmaConfig,
        reporters: ["coverage", "progress"],
        background: true,
        singleRun: false
    }).start();
});

gulp.task("sauce", function(done) {
    new karma.Server({
        configFile: require.resolve("./conf/karma.conf-ci.js")
    }, function() {
        // always return success result for this task
        done(null);
    }).start();
});

gulp.task("clean-jsdoc", function() {
    return gulp.src("docs", {read: false}).pipe(clean());
});

gulp.task("build-jsdoc", ["clean-jsdoc"], function(done) {
    const config = require("./conf/jsdoc.json");

    gulp.src(["./src/**/*.js"], {read: false})
        .pipe(jsdoc(config, done));
});

gulp.task("gh-pages", ["build-jsdoc"], function() {
    // var lib = require.resolve("./build/better-dom");

    return gulp.src("./docs/**/*")
        // remove absolute paths from jsdocs
        // .pipe(replace(lib, "better-dom.js"))
        .pipe(deploy({message: "v" + pkg.version}));
});

gulp.task("bower", function() {
    return gulp.src("./bower.json")
        .pipe(bump({version: pkg.version}))
        .pipe(gulp.dest("./"));
});

gulp.task("dist", ["browsers", "bower"], function() {
    return gulp.src("build/better-dom.js")
        // clienup multiline comments: jsdocs, directives etc.
        .pipe(replace(/\/\*([\s\S]*?)\*\/\s+/gm, ""))
        .pipe(header(banner + "\n", pkg))
        .pipe(gulp.dest("dist/"))
        .pipe(uglify({preserveComments: "license"}))
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest("dist/"));
});
