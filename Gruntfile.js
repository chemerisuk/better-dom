module.exports = function(grunt) {
    "use strict";

    var pkg = grunt.file.readJSON("package.json"),
        gruntDeps = function(name) { return !name.indexOf("grunt-") };

    grunt.initConfig({
        pkg: pkg,
        watch: {
            build: {
                files: ["src/*.js"],
                tasks: ["browserify:compile", "karma:watch:run"]
            },
            legacy: {
                files: ["legacy/*.js"],
                tasks: ["browserify:legacy"]
            },
            specs: {
                files: ["test/spec/*.js"],
                tasks: ["karma:watch:run"]
            },
        },
        jshint: {
            all: ["src/*.js", "test/spec/*.js", "Gruntfile.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        jsdoc: {
            dist: {
                src: ["build/*.js", "README.md"],
                options: {
                    destination: "jsdoc",
                    template: "node_modules/ink-docstrap/template",
                    configure: "extra/jsdoc.conf.json"
                }
            }
        },
        karma: {
            options: {
                configFile: "test/lib/karma.conf.js"
            },
            all: {
                browsers: ["PhantomJS", "Chrome", "ChromeCanary", "Opera", "Safari", "Firefox"],
                reporters: ["progress"],
                singleRun: true
            },
            watch: {
                preprocessors: { "build/better-dom.js": "coverage" },
                reporters: ["coverage", "progress"],
                background: true
            },
            unit: {
                singleRun: true,
                preprocessors: { "build/better-dom.js": "coverage" },
                reporters: ["coverage", "dots"],
                coverageReporter: {
                    type: "lcovonly",
                    dir: "coverage/"
                }
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
                    // remove incorrect <static> directives
                    "grep -rl '&lt;static> ' jsdoc/*.html | xargs sed -i \"\" 's/&lt;static> //g'",
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
                    // copy files to dist folder
                    "cp build/*.js dist/",
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
        uglify: {
            options: {
                sourceMap: true,
                preserveComments: "some",
                report: "gzip"
            },
            build: {
                files: {
                    "build/<%= pkg.name %>.min.js": ["build/<%= pkg.name %>.js"]
                }
            },
            legacy: {
                files: {
                    "build/<%= pkg.name %>-legacy.min.js": ["build/<%= pkg.name %>-legacy.js"]
                }
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
        browserify: {
            legacy: {
                files: {
                    "build/better-dom-legacy.js": [
                        "legacy/*.js",
                        "bower_components/html5shiv/src/html5shiv.js",
                        "bower_components/es5-shim/es5-shim.js"
                    ]
                },
                options: {
                    postBundleCB: function(err, src, next) {
                        // append copyrights header
                        next(err, grunt.template.process(
                            "/**\n" +
                            " * @file <%= pkg.name %>-legacy.js\n" +
                            " * @version <%= pkg.version %> <%= grunt.template.today('isoDateTime') %>\n" +
                            " * @overview <%= pkg.description %>\n" +
                            " * @copyright 2013-<%= grunt.template.today('yyyy') %> <%= pkg.author %>\n" +
                            " * @license <%= pkg.license %>\n" +
                            " * @see <%= pkg.repository.url %>\n" +
                            " */\n" +
                        src));
                    }
                }
            },
            compile: {
                files: {
                    "build/better-dom.js": ["src/*.js"]
                },
                options: {
                    transform: ["browserify-es6-modules", "es6-browserify"],
                    postBundleCB: function(err, src, next) {
                        // append copyrights header
                        next(err, grunt.template.process(
                            "/**\n" +
                            " * @file <%= pkg.name %>.js\n" +
                            " * @version <%= pkg.version %> <%= grunt.template.today('isoDateTime') %>\n" +
                            " * @overview <%= pkg.description %>\n" +
                            " * @copyright 2013-<%= grunt.template.today('yyyy') %> <%= pkg.author %>\n" +
                            " * @license <%= pkg.license %>\n" +
                            " * @see <%= pkg.repository.url %>\n" +
                            " */\n" +
                        src));
                    }
                }
            }
        }
    });

    Object.keys(pkg.devDependencies).filter(gruntDeps).forEach(grunt.loadNpmTasks);

    grunt.registerTask("dev", [
        "clean:build",
        "browserify",
        "jshint",
        "connect",
        "karma:watch",
        "watch"
    ]);

    grunt.registerTask("test", [
        "jshint",
        "karma:unit"
    ]);

    grunt.registerTask("docs", [
        "clean:jsdoc",
        "jsdoc"
    ]);

    grunt.registerTask("default", "information about modules", function() {
        var modules = grunt.file.readJSON("extra/modules.json");

        grunt.log.writeln(
            grunt.log.table([15, 40, 70],
                ["\nMODULE", "\nDESCRIPTION", "\nURL"]
            )
        );

        Object.keys(modules).forEach(function(name) {
            grunt.log.writeln(
                grunt.log.table([15, 40, 70],
                    [name.yellow.bold, modules[name].title, pkg.docs + "/module-" + name + ".html"]
                )
            );
        });

        grunt.log.writeln("\nPick one or several comma-separated modules above to exclude them from build, e.g.\n");
        grunt.log.writeln("    grunt build:classes,offset,data");
    });

    grunt.registerTask("build", "make a build", function(excluded) {
        var modules = grunt.file.readJSON("extra/modules.json"),
            args = excluded === "min" ? Object.keys(modules) : (excluded ? excluded.split(",") : []),
            options = grunt.config.get("browserify.compile.options");

        options.ignore = args.reduce(function(memo, arg) {
            var module = modules[arg];

            if (!module) throw Error("Illegal module name '" + arg + "'\n\n");

            memo.push.apply(memo, module.files);

            return memo;
        }, []);

        grunt.config.set("browserify.compile.options", options);

        grunt.log.ok("Making a build that doesn't contain modules:");
        grunt.log.subhead(args.length ? args : "All modules are included");

        grunt.task.run([
            "clean:build",
            "browserify"
        ]);
    });

    grunt.registerTask("publish", "Publish a new version routine", function(version) {
        grunt.config.set("pkg.version", version);

        grunt.registerTask("updateVersion", function(filename) {
            var json = grunt.file.readJSON(filename);

            json.version = version;

            grunt.file.write(filename, JSON.stringify(json, null, 2));
        });

        grunt.task.run([
            "karma:all",
            "shell:checkVersionTag",
            "docs",
            "shell:updateDocs",
            "browserify",
            "updateVersion:package.json",
            "updateVersion:bower.json",
            "shell:releaseVersion"
        ]);
    });
};
