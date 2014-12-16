var gulp = require("gulp");
var gulpif = require("gulp-if");
var gutil = require("gulp-util");
var pkg = require("./package.json");
var compile = require("./task/compile");
var es6transpiler = require("gulp-es6-transpiler");
var template = require("gulp-template");
var jshint = require("gulp-jshint");
var symlink = require("gulp-symlink");
var argv = require("yargs").argv;
var jsdoc = require("gulp-jsdoc");
var clean = require("gulp-clean");
var uglify = require("gulp-uglify");
var rename = require("gulp-rename");
var bump = require("gulp-bump");
var deploy = require("gulp-gh-pages");
var replace = require("gulp-replace");
var git = require("gulp-git");
var filter = require("gulp-filter");
var tag_version = require("gulp-tag-version");
var concat = require("gulp-concat");
var plumber = require("gulp-plumber");
var header = require("gulp-header");

var karma = require("karma").server;
var karmaConfig = require.resolve("./conf/karma.conf");

var banner = [
    "/**",
    " * @overview <%= pkg.name %>: <%= pkg.description %>",
    " * @version <%= pkg.version %> <%= new Date().toUTCString() %>",
    " * @copyright 2013-2014 <%= pkg.author %>",
    " * @license <%= pkg.license %>",
    " * @see <%= pkg.repository.url %>",
    " */"
].join("\n");


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
    var version = argv.tag;
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

    return gulp.src(["document/*.js", "element/*.js", "global/*.js", "util/*.js", "*.js"], {cwd: "./src"})
        .pipe(gulpif(!process.env.TRAVIS_JOB_NUMBER, plumber()))
        .pipe(jshint(".jshintrc"))
        .pipe(jshint.reporter("jshint-stylish"))
        .pipe(jshint.reporter("fail"))
        .pipe(compile("better-dom.js"))
        .pipe(template({
            pkg: pkg,
            prop: function(name) {
                return name ? name + version : "__" + version + "__";
            }
        }))
        .pipe(es6transpiler())
        // clienup multiline comments: jsdocs, directives etc.
        .pipe(gulpif(dest === "dist/", replace(/\/\*([\s\S]*?)\*\/\s+/gm, "")))
        .pipe(header(banner + "\n", { pkg: pkg }))
        .pipe(gulp.dest(dest));
});

gulp.task("compile-legacy", ["lint-legacy"], function() {
    var version = argv.tag;
    var dest = version ? "dist/" : "build/";

    return gulp.src(["bower_components/html5shiv/dist/html5shiv.js","bower_components/es5-shim/es5-shim.js","src/legacy/*.js"])
        .pipe(template({ pkg: pkg }))
        .pipe(concat("better-dom-legacy.js"))
        .pipe(gulpif(dest === "dist/", uglify({ output: {comments: /^!|@preserve|@license|@cc_on/i} })))
        .pipe(gulp.dest(dest));
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
        if (argv.all) {
            config.browsers = ["PhantomJS", "Chrome", "ChromeCanary", "Opera", "Safari", "Firefox"];
        } else if (argv.ie8) {
            config.browsers = ["IE8 - WinXP"];
        } else if (argv.ie9 || argv.ie10 || argv.ie11) {
            config.browsers = ["IE" + (argv.ie9 ? "9" : (argv.ie10 ? "10" : "11")) + " - Win7"];
        }
    }

    config.configFile = karmaConfig;

    karma.start(config, function(resultCode) {
        done(resultCode ? new gutil.PluginError("karma", "Specs were not passed") : null);
    });
});

gulp.task("dev", ["compile", "compile-legacy", "symlink", "lint-test"], function() {
    gulp.watch(["src/document/*.js", "src/element/*.js", "src/global/*.js", "src/util/*.js", "src/*.js"], ["compile"]);
    gulp.watch(["src/legacy/*.js"], ["compile-legacy"]);
    gulp.watch(["test/spec/**/*.js"], ["lint-test"]);

    karma.start({
        // browsers: ["IE8 - WinXP"],
        configFile: karmaConfig,
        reporters: ["coverage", "progress"],
        background: true,
        singleRun: false
    });
});

gulp.task("sauce", function(done) {
    karma.start({
        configFile: require.resolve("./conf/karma.conf-ci.js")
    }, function() {
        // always return success result for this task
        // have to use process.exit to make travis to be happy
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
        .pipe(uglify({preserveComments: "some"}))
        .pipe(rename("better-dom.min.js"))
        .pipe(gulp.dest(dest));
});

gulp.task("bump", function() {
    return gulp.src(["./*.json"])
        .pipe(bump({version: argv.tag}))
        .pipe(gulp.dest("./"));
});

gulp.task("release", ["bump", "compress"], function(done) {
    var version = argv.tag;

    if (!version) throw new gutil.PluginError("release", "You need to specify --tag parameter");

    gulp.src(["./*.json", "./dist/*.js"])
        .pipe(git.commit("version " + version))
        .pipe(filter("package.json"))
        .pipe(tag_version())
        .on("end", function() {
            git.push("origin", "master", {}, function() {
                git.push("origin", "master", {args: "--tags"}, done);
            });
        });
});
