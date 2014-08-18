var pkg = require("./package.json");

module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: pkg,
        watch: {
            lib: {
                files: ["src/*.js", "src/**/*.js"],
                tasks: ["compile", "karma:watch:run"]
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
                    template: "node_modules/jaguarjs-jsdoc",
                    configure: "conf/jsdoc.conf.json"
                }
            }
        },
        karma: {
            options: {
                configFile: "conf/karma.conf.js"
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
                sourceMap: false,
                preserveComments: "some",
                report: "gzip"
            },
            lib: {
                src: ["build/better-dom.js"],
                dest: "build/better-dom.min.js"
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
                    " * @file <%= pkg.name %>",
                    " * @version <%= pkg.version %> <%= grunt.template.today('isoDateTime') %>",
                    " * @overview <%= pkg.description %>",
                    " * @copyright 2013-<%= grunt.template.today('yyyy') %> <%= pkg.author %>",
                    " * @license <%= pkg.license %>",
                    " * @see <%= pkg.repository.url %>",
                    " */"
                ].join("\n")
            },
            lib: {
                cwd: "src/",
                src: ["*.js", "**/*.js"],
                dest: "build/better-dom.js"
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
        "clean:build",
        "compile",
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
        "clean",
        "compile",
        "jsdoc"
    ]);

    grunt.registerTask("build", "make a build", function() {
        // var modules = grunt.file.readJSON("extra/modules.json"),
        //     args = excluded === "min" ? Object.keys(modules) : (excluded ? excluded.split(",") : []),
        //     options = grunt.config.get("browserify.compile.options");

        // options.ignore = args.reduce(function(memo, arg) {
        //     var module = modules[arg];

        //     if (!module) throw Error("Illegal module name '" + arg + "'\n\n");

        //     memo.push.apply(memo, module.files);

        //     return memo;
        // }, []);

        // grunt.config.set("browserify.compile.options", options);

        // grunt.log.ok("Making a build that doesn't contain modules:");
        // grunt.log.subhead(args.length ? args : "All modules are included");

        grunt.task.run([
            "clean:build",
            "compile"
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
            "jshint",
            "karma:all",
            "shell:checkVersionTag",
            "docs",
            "shell:updateDocs",
            "browserify",
            "uglify",
            "updateVersion:package.json",
            "updateVersion:bower.json",
            "shell:releaseVersion"
        ]);
    });
};
