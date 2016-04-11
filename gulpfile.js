var gulp = require("gulp");
var gulpif = require("gulp-if");
var gutil = require("gulp-util");
var pkg = require("./package.json");
var compile = require("./task/compile");
var babel = require("gulp-babel");
var template = require("gulp-template");
var jshint = require("gulp-jshint");
var symlink = require("gulp-symlink");
var argv = require("yargs").argv;
var jsdoc = require("gulp-jsdoc");
var clean = require("gulp-clean");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var deploy = require("gulp-gh-pages");
var replace = require("gulp-replace");
var git = require("gulp-git");
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


gulp.task("lint-legacy", function() {
    return gulp.src(["src/legacy/*.js"])
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(gulpif(process.env.TRAVIS_JOB_NUMBER, jshint.reporter("fail")));
});

gulp.task("lint-test", function() {
    return gulp.src(["test/spec/**/*.js"])
        .pipe(jshint(require("./conf/jshintrc-test")))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(gulpif(process.env.TRAVIS_JOB_NUMBER, jshint.reporter("fail")));
});

gulp.task("compile", function() {
    return gulp.src(["document/*.js", "element/*.js", "util/*.js", "*.js"], {cwd: "./src"})
        .pipe(gulpif(!process.env.TRAVIS_JOB_NUMBER, plumber()))
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(jshint.reporter("fail"))
        .pipe(compile("better-dom.js", pkg))
        .pipe(babel())
        .pipe(header(banner + "\n", pkg))
        .pipe(gulp.dest("build/"));
});

gulp.task("compile-legacy", ["lint-legacy"], function() {
    return gulp.src(["node_modules/html5shiv/dist/html5shiv.js","node_modules/es5-shim/es5-shim.js","src/legacy/*.js"])
        .pipe(template({ pkg: pkg }))
        .pipe(concat("better-dom-legacy.js"))
        .pipe(gulp.dest(process.env.npm_package_version ? "dist/" : "build/"));
});

gulp.task("symlink", ["compile-legacy"], function() {
    return gulp.src(["dist/better-dom-legacy.ht*"])
        .pipe(symlink("build/"));
});

gulp.task("test", ["compile", "compile-legacy", "symlink", "lint-test"], function(done) {
    var config = {preprocessors: []};

    if (process.env.TRAVIS_JOB_NUMBER) {
        config = {
            reporters: ["coverage", "dots", "coveralls"],
            coverageReporter: {
                type: "lcovonly",
                dir: "coverage/"
            }
        };
    } else {
        if (argv.all || process.env.npm_package_version) {
            config.browsers = ["PhantomJS", "Chrome", /*"ChromeCanary", */"Opera", "Safari", "Firefox"];
        } else if (argv.ie8) {
            config.browsers = ["IE8 - WinXP"];
        } else if (argv.ie9 || argv.ie10 || argv.ie11) {
            config.browsers = ["IE" + (argv.ie9 ? "9" : (argv.ie10 ? "10" : "11")) + " - Win7"];
        }
    }

    config.configFile = karmaConfig;

    new karma.Server(config, function(resultCode) {
        done(resultCode ? new gutil.PluginError("karma", "Tests failed") : null);
    }).start();
});

gulp.task("dev", ["compile", "compile-legacy", "symlink", "lint-test"], function() {
    gulp.watch(["src/document/*.js", "src/element/*.js", "src/util/*.js", "src/*.js"], ["compile"]);
    gulp.watch(["src/legacy/*.js"], ["compile-legacy"]);
    gulp.watch(["test/spec/**/*.js"], ["lint-test"]);

    new karma.Server({
        // browsers: ["IE8 - WinXP"],
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
    return gulp.src("jsdoc", {read: false}).pipe(clean());
});

gulp.task("docs", ["clean-jsdoc", "compile"], function() {
    var config = require("./conf/jsdoc.conf");

    return gulp.src(["build/*.js", "README.md"])
        .pipe(jsdoc("jsdoc", config));
});

gulp.task("gh-pages", ["docs"], function() {
    var lib = require.resolve("./build/better-dom");

    return gulp.src("./jsdoc/**/*")
        // remove absolute paths from jsdocs
        .pipe(replace(lib, "better-dom.js"))
        .pipe(deploy());
});

gulp.task("bower", function() {
    return gulp.src("./bower.json")
        .pipe(bump({version: pkg.version}))
        .pipe(gulp.dest("./"));
});

gulp.task("dist", ["test", "bower"], function(done) {
    gulp.src("build/better-dom.js")
        // clienup multiline comments: jsdocs, directives etc.
        .pipe(replace(/\/\*([\s\S]*?)\*\/\s+/gm, ""))
        .pipe(header(banner + "\n", pkg))
        .pipe(gulp.dest("dist/"))
        .pipe(uglify({preserveComments: "license"}))
        .pipe(rename({extname: ".min.js"}))
        .pipe(gulp.dest("dist/"))
        .on("end", function() {
            git.exec({args: "add -A dist bower.json", quiet: true}, done);
        });
});
