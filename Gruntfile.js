module.exports = function(grunt) {
    "use strict";

    var pkg = grunt.file.readJSON("package.json"),
        gruntDeps = function(name) {
            return !name.indexOf("grunt-");
        };

    grunt.initConfig({
        pkg: pkg,

        watch: {
            jasmine: {
                files: ["test/spec/*.js"],
                tasks: ["karma:coverage:run"]
            },
            build: {
                files: ["src/*.js"],
                tasks: ["browserify", "karma:coverage:run"]
            }
        },
        jshint: {
            all: ["src/*.js", "test/spec/*.js", "Gruntfile.js"],
            options: {
                jshintrc: ".jshintrc"
            }
        },
        jsdoc: {
            dist: {
                src: ["src/*.js", "jsdoc/README.md"],
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
                singleRun: true
            },
            coverage: {
                preprocessors: { "build/*.js": "coverage" },
                reporters: ["coverage", "progress"],
                background: true
            },
            unit: {
                singleRun: true
            }
        },
        shell: {
            checkVersionTag: {
                command: "git tag -a v<%= pkg.version %> -m ''",
                options: { failOnError: true }
            },
            checkoutDocs: {
                command: [
                    // commit all changes
                    "git commit -am 'version <%= pkg.version %>'",

                    // checkout jsdoc branch
                    "git checkout gh-pages"
                ].join(" && ")
            },
            updateDocs: {
                command: [
                    // get a list of all files in stage and delete everything except for targets, node_modules, cache, temp, and logs
                    // rm does not delete root level hidden files
                    "ls | grep -v ^jsdoc$ | grep -v ^node_modules$ | grep -v ^bower_components$ | xargs rm -r ",

                    // copy from the stage folder to the current (root) folder
                    "cp -r jsdoc/* . && rm -r jsdoc",

                    // add any files that may have been created
                    "git add -A",

                    // commit all files using the version number as the commit message
                    "git commit -am 'Build: <%= grunt.file.read(\".build\") %>'",

                    // switch back to the previous branch we started from
                    "git checkout -",

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
            }
        },
        clean: {
            dist: ["dist/"],
            jsdoc: ["jsdoc/"]
        },
        copy: {
            dist: {
                files: {
                    "dist/<%= pkg.name %>.js": ["build/<%= pkg.name %>.js"],
                    "dist/<%= pkg.name %>.htc": ["extra/<%= pkg.name %>.htc"]
                }
            },
            readme: {
                options: {
                    processContent: function(content) {
                        return content
                            // remove the first line
                            .replace(/^# .+/, "&nbsp;")
                            // remove docs link
                            .replace("[API DOCUMENTATION](http://chemerisuk.github.io/better-dom/)", "")
                            // remove source code
                            .replace(/```[^`]+```/g, "");
                    }
                },
                files: {
                    "jsdoc/README.md": ["README.md"]
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    preserveComments: "some",
                    report: "gzip",
                    sourceMap: "build/<%= pkg.name %>.min.src",
                    sourceMappingURL: "<%= pkg.name %>.min.src"
                },
                files: {
                    "build/<%= pkg.name %>.min.js": ["build/<%= pkg.name %>.js"]
                }
            }
        },
        connect: {
            watch: {
                options: {
                    base: "../"
                }
            }
        },
        browserify: {
            compile: {
                files: {
                    "build/better-dom.js": ["src/*.js"]
                },
                options: {
                    postBundleCB: function(err, src, next) {
                        // apeend strict mode
                        src = src.replace("{", "{\"use strict\";");
                        // append copyrights header
                        next(err, grunt.template.process(
                            "/**\n" +
                            " * @file <%= pkg.name %>\n" +
                            " * @version <%= pkg.version %> <%= grunt.template.today('isoDateTime') %>\n" +
                            " * @overview <%= pkg.description %>\n" +
                            " * @copyright <%= pkg.author %> <%= grunt.template.today('yyyy') %>\n" +
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
        "browserify",
        "jshint",
        "connect",
        "karma:coverage",
        "watch"
    ]);

    grunt.registerTask("test", [
        "browserify",
        "jshint",
        "karma:unit"
    ]);

    grunt.registerTask("docs", [
        "clean:jsdoc",
        "copy:readme",
        "jsdoc"
    ]);

    grunt.registerTask("publish", "Publish a new version routine", function(version) {
        grunt.config.set("pkg.version", version);

        grunt.registerTask("updateFileVersion", function(filename) {
            var json = grunt.file.readJSON(filename);

            json.version = version;

            grunt.file.write(filename, JSON.stringify(json, null, 4));
        });

        grunt.registerTask("bumpDocsBuild", function () {
            var path = require("path"),
                build = ".build";

            grunt.file.write(build, path.existsSync(build) ? parseInt(grunt.file.read(build), 10) + 1 : 1);
        });

        grunt.task.run([
            "shell:checkVersionTag",
            "karma:all",
            "updateFileVersion:package.json",
            "updateFileVersion:bower.json",
            "browserify",
            "copy:dist",
            "docs",
            "shell:checkoutDocs",
            "bumpDocsBuild",
            "shell:updateDocs"
        ]);
    });
};
