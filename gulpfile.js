var gulp = require("gulp");
var gulpif = require("gulp-if");
var gutil = require("gulp-util");
var pkg = require("./package.json");
var karma = require("karma").server;
var compile = require("./task/compile");
var es6transpiler = require("gulp-es6-transpiler");
var template = require("gulp-template");
var jshint = require("gulp-jshint");
var symlink = require("gulp-symlink");
var argv = require("yargs").argv;
var jsdoc = require("gulp-jsdoc");
var clean = require("gulp-clean");
var uglify = require("gulp-uglifyjs");
var bump = require("gulp-bump");
var deploy = require("gulp-gh-pages");
var replace = require("gulp-replace");
var git = require("gulp-git");
var filter = require("gulp-filter");
var tag_version = require("gulp-tag-version");


gulp.task("compile", function() {
    var version = argv.tag;
    var jsdoc = !version;
    var dest = version ? "dist/" : "build/";

    if (version) {
        pkg.version = version;
    } else {
        version = pkg.version;
    }

    // make a version number string, e.g. "1.20.3" -> "1020300"
    version = version.replace(/\.(\d+)/g, function(_, n) {
        return ("000" + n).slice(-3);
    });

    return gulp.src(["*.js", "**/*.js"], {buffer: false, cwd: "./src"})
        .pipe(compile("better-dom.js", {jsdoc: jsdoc}))
        .pipe(template({ pkg: pkg, VERSION_NUMBER: version }))
        .pipe(es6transpiler())
        .pipe(gulp.dest(dest));
});

gulp.task("lint", function() {
    return gulp.src(["src/*.js", "src/**/*.js", "test/spec/**/*.js", "*.js"])
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(gulpif(process.env.TRAVIS_JOB_NUMBER, jshint.reporter("fail")));
});

gulp.task("symlink", function() {
    return gulp.src("dist/better-dom.htc")
        .pipe(symlink("build/better-dom.htc"));
});

gulp.task("test", ["compile", "symlink", "lint"], function(done) {
    var config = {};

    if (process.env.TRAVIS_JOB_NUMBER) {
        config = {
            preprocessors: { "build/better-dom.js": "coverage" },
            reporters: ["coverage", "dots", "coveralls"],
            coverageReporter: {
                type: "lcovonly",
                dir: "coverage/"
            }
        };
    } else {
        if (argv.all) {
            config.browsers = ["PhantomJS", "Chrome", "ChromeCanary", "Opera", "Safari", "Firefox"];
        } else if (argv.ie8) {
            config.browsers = ["IE8 - WinXP"];
        } else if (argv.ie9 || argv.ie10 || argv.ie11) {
            config.browsers = ["IE" + (argv.ie9 ? "9" : (argv.ie10 ? "10" : "11")) + " - Win7"];
        }
    }

    config.configFile = require.resolve("./conf/karma.conf");

    karma.start(config, done);
});

gulp.task("dev", ["compile", "symlink", "lint"], function() {
    gulp.watch(["src/*.js", "src/**/*.js"], ["compile"]);

    karma.start({
        // browsers: ["IE8 - WinXP"],
        configFile: require.resolve("./conf/karma.conf"),
        preprocessors: { "build/better-dom.js": "coverage" },
        reporters: ["coverage", "progress"],
        background: true,
        singleRun: false
    });
});

gulp.task("sauce", function() {
    karma.start({
        configFile: require.resolve("./conf/karma.conf-ci.js")
    }, function() {
        // always return success result for this task
        process.exit(0);
    });
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

gulp.task("compress", ["test"], function() {
    var dest = argv.tag ? "dist/" : "build/";

    return gulp.src(dest + "better-dom.js")
        .pipe(uglify("better-dom.min.js", {
            output: {comments: /^!|@preserve|@license|@cc_on/i}
        }))
        .pipe(gulp.dest(dest));
});

gulp.task("bump", function() {
    return gulp.src(["./*.json"])
        .pipe(bump({version: argv.tag}))
        .pipe(gulp.dest("./"));
});

gulp.task("release", ["bump", "compress"], function() {
    var version = argv.tag;

    if (!version) throw new gutil.PluginError("release", "You need to specify --tag parameter");

    gulp.src(["./*.json", "./dist/*.js"])
        .pipe(git.commit("version " + version))
        .pipe(filter("package.json"))
        .pipe(tag_version());
});
