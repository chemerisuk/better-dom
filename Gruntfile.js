var pkg = require("./package.json");

module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: pkg,
        watch: {
            lib: {
                files: ["src/*.js", "src/**/*.js"],
                tasks: ["compile:build", "karma:watch:run"]
            },
            specs: {
                files: ["test/spec/*.js", "test/spec/**/*.js", "dist/better-dom.htc"],
                tasks: ["karma:watch:run"]
            },
        },
        jshint: {
            src: ["src/*.js", "src/**/*.js", "Gruntfile.js"],
            specs: ["test/spec/*.js", "test/spec/**/*.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        jsdoc: {
            dist: {
                src: ["build/*.js", "README.md"],
                options: {
                    destination: "jsdoc",
                    template: "node_modules/jaguarjs-jsdoc",
                    configure: "conf/jsdoc.conf.json"
                }
            }
        },
        karma: {
            options: {
                configFile: "conf/karma.conf.js",
                files: [
                    // legacy IE file includes
                    {pattern: "./build/better-dom.htc", served: true, included: false},
                    "./bower_components/es5-shim/es5-shim.js",
                    "./bower_components/html5shiv/dist/html5shiv.js",
                    // normal browser file includes
                    "./test/lib/jasmine-better-dom-matchers.js",
                    "./build/better-dom.js",
                    "./test/spec/*.spec.js",
                    "./test/spec/**/*.spec.js"
                ]
            },
            all: {
                browsers: ["PhantomJS", "Chrome", "ChromeCanary", "Opera", "Safari", "Firefox"],
                reporters: ["progress"]
            },
            ie: {
                browsers: ["IE8 - WinXP"],
                reporters: ["progress"]
            },
            watch: {
                // browsers: ["IE8 - WinXP"],
                preprocessors: { "build/better-dom.js": "coverage" },
                reporters: ["coverage", "progress"],
                background: true,
                singleRun: false
            },
            unit: {
                reporters: ["dots"]
            },
            travis: {
                preprocessors: { "build/better-dom.js": "coverage" },
                reporters: ["coverage", "dots", "coveralls"],
                coverageReporter: {
                    type: "lcovonly",
                    dir: "coverage/"
                }
            },
            sauce: {
                configFile: "conf/karma.conf-ci.js"
            }
        },
        shell: {
            checkVersionTag: {
                command: "git tag -a v<%= pkg.version %> -m ''",
                options: { failOnError: true }
            },
            updateDocs: {
                command: [
                    // checkout jsdoc branch
                    "git checkout gh-pages",
                    // get a list of all files in stage and delete everything except for targets, node_modules, cache, temp, and logs
                    // rm does not delete root level hidden files
                    "ls | grep -v ^jsdoc$ | grep -v ^node_modules$ | grep -v ^bower_components$ | xargs rm -r ",
                    // copy from the stage folder to the current (root) folder
                    "cp -r jsdoc/* . && rm -r jsdoc",
                    // add any files that may have been created
                    "git add -A",
                    // commit all files using the version number as the commit message
                    "git commit -am 'version <%= pkg.version %>'",
                    // switch back to the previous branch we started from
                    "git checkout -",

                ].join(" && "),
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            releaseVersion: {
                command: [
                    // commit all changes
                    "git commit -am 'version <%= pkg.version %>'",
                    // update version tag
                    "git tag -af v<%= pkg.version %> -m 'version <%= pkg.version %>'",
                    // push file changed
                    "git push origin --all",
                    // push new tag
                    "git push origin v<%= pkg.version %>"
                ].join(" && "),
                options: {
                    stdout: true,
                    stderr: true
                }
            },
        },
        clean: {
            build: ["build/"],
            jsdoc: ["jsdoc/"]
        },
        symlink: {
            htc: {
                src: "dist/better-dom.htc",
                dest: "build/better-dom.htc",
            }
        },
        uglify: {
            options: {
                sourceMap: false,
                preserveComments: "some",
                report: "gzip"
            },
            build: {
                src: ["build/better-dom.js"],
                dest: "build/better-dom.min.js"
            },
            dist: {
                src: ["dist/better-dom.js"],
                dest: "dist/better-dom.min.js"
            }
        },
        connect: {
            watch: {
                options: {
                    hostname: "*",
                    base: "../"
                }
            }
        },
        compile: {
            options: {
                banner: [
                    "/**",
                    " * @overview <%= pkg.name %>: <%= pkg.description %>",
                    " * @version <%= pkg.version %> <%= grunt.template.today('isoDateTime') %>",
                    " * @copyright 2013-<%= grunt.template.today('yyyy') %> <%= pkg.author %>",
                    " * @license <%= pkg.license %>",
                    " * @see <%= pkg.repository.url %>",
                    " */"
                ].join("\n")
            },
            build: {
                cwd: "src/",
                src: ["*.js", "**/*.js"],
                dest: "build/better-dom.js"
            },
            dist: {
                options: { jsdocs: false },
                cwd: "src/",
                src: ["*.js", "**/*.js"],
                dest: "dist/better-dom.js"
            }
        }
    });

    // load local tasks
    grunt.loadTasks("task");

    // load NPM tasks.
    Object.keys(pkg.devDependencies).forEach(function(name) {
        if (name.indexOf("grunt-") === 0) {
            grunt.loadNpmTasks(name);
        }
    });

    grunt.registerTask("dev", [
        "build",
        "jshint",
        "connect",
        "karma:watch",
        "watch"
    ]);

    grunt.registerTask("test", [
        "jshint",
        "build",
        "karma:unit"
    ]);

    grunt.registerTask("travis", [
        "jshint",
        "build",
        "karma:travis"
    ]);

    grunt.registerTask("docs", [
        "clean",
        "compile:build",
        "jsdoc"
    ]);

    grunt.registerTask("build", "make a build", function() {
        // TODO: manage excluded modules
        grunt.task.run([
            "clean:build",
            "symlink:htc",
            "compile:build"
        ]);
    });

    grunt.registerTask("ie", "test IE using ievms", function(version) {
        if (version > 8) {
            grunt.config.set("karma.ie.browsers", ["IE" + version + " - Win7"]);
        }

        grunt.task.run(["build", "karma:ie"]);
    });

    grunt.registerTask("publish", "Publish a new version routine", function(version) {
        grunt.config.set("pkg.version", version);

        grunt.registerTask("updateVersion", function(filename) {
            var json = grunt.file.readJSON(filename);

            json.version = version;

            grunt.file.write(filename, JSON.stringify(json, null, 2));
        });

        grunt.task.run([
            "jshint",
            "karma:all",
            "shell:checkVersionTag",
            "jsdoc",
            "shell:updateDocs",
            "compile:dist",
            "uglify:dist",
            "updateVersion:package.json",
            "updateVersion:bower.json",
            "shell:releaseVersion"
        ]);
    });
};
