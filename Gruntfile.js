module.exports = function(grunt) {
    "use strict";

    var pkg = grunt.file.readJSON("package.json"),
        gruntDeps = function(name) {
            return !name.indexOf("grunt-") && name !== "grunt-template-jasmine-istanbul";
        };

    grunt.initConfig({
        pkg: pkg,

        jasmine: {
            options: {
                vendor: [
                    "test/lib/jasmine-dom/jasmine-dom-fixtures.js",
                    "test/lib/jasmine-dom/jasmine-dom-matchers.js",
                    "node_modules/lodash/lodash.js"
                ],
                specs: "test/spec/*.spec.js",
                keepRunner: true
            },
            unit: {
                src: ["build/*.js"]
            },
            coverage: {
                src: ["build/*.js"],
                options: {
                    template: require("grunt-template-jasmine-istanbul"),
                    templateOptions: {
                        coverage: "coverage/coverage.json",
                        report: "coverage"
                    }
                }
            }
        },
        watch: {
            jasmine: {
                files: ["test/spec/*.js"],
                tasks: ["jasmine:coverage"]
            },
            build: {
                files: ["src/*.js"],
                tasks: ["requirejs", "jasmine:coverage"]
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
                    destination: "jsdoc"
                }
            }
        },
        karma: {
            unit: {
                configFile: "test/lib/karma.conf"
            },
            speed: {
                configFile: "test/lib/karma.conf",
                browsers: ["<%= pkg.speed.browser %>"],
                options: {
                    files: [
                        "node_modules/benchmark/benchmark.js",
                        "test/lib/benchmine/benchmine-env.js",
                        "test/lib/karma-benchmine-adapter.js",
                        "test/lib/benchmine/benchmine-report-karma.js",
                        "bower_components/jquery/jquery.js",
                        "build/*.js",
                        "test/speed/<%= pkg.speed.task %>.suite.js"
                    ]
                }
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
            },
            showCoverage: {
                command: "ls -lrt -d -1 $PWD/coverage",
                options: {
                    stdout: true
                }
            },
            rollbackPublished: {
                command: "git checkout HEAD -- <%= pkg.name %>.js <%= pkg.name %>.htc"
            }
        },
        clean: {
            dist: ["dist/"],
            jsdoc: ["jsdoc/"]
        },
        copy: {
            dist: {
                files: {
                    "dist/<%= pkg.name %>-<%= pkg.version %>.js": ["<%= pkg.name %>.js"],
                    "dist/<%= pkg.name %>-<%= pkg.version %>.htc": ["<%= pkg.name %>.htc"]
                }
            },
            publish: {
                files: {
                    "<%= pkg.name %>.js": ["build/<%= pkg.name %>.js"],
                    "<%= pkg.name %>.htc": ["extra/<%= pkg.name %>.htc"]
                }
            },
            readme: {
                options: {
                    processContent: function(content) {
                        return content
                            // remove build status indicator
                            .replace(/\[!\[Build Status\][^\n]*/, "")
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
                    sourceMap: "dist/<%= pkg.name %>-<%= pkg.version %>.min.src",
                    sourceMappingURL: "<%= pkg.name %>-<%= pkg.version %>.min.src"
                },
                files: {
                    "dist/<%= pkg.name %>-<%= pkg.version %>.min.js": ["dist/<%= pkg.name %>-<%= pkg.version %>.js"]
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
        requirejs: {
            options: {
                optimize: "none",
                optimizeCss: "none",
                useStrict: true,
                baseUrl: "src",
                name: "DOM",
                create: true,
                logLevel: 2,
                skipPragmas: true,
                skipModuleInsertion: true,
                include: [
                    "Node.supports", "Node.find", "Node.data", "Node.contains", "Node.events",
                    "SelectorMatcher", "EventHandler", "Element.classes", "Element.clone",
                    "Element.manipulation", "Element.matches", "Element.offset", "Element.get",
                    "Element.set", "Element.styles", "Element.traversing", "Element.bind",
                    "Element.visibility", "Element.collection", "CompositeElement", "DOM.watch",
                    "DOM.create", "DOM.extend", "DOM.parsetemplate", "DOM.importstyles", "DOM.ready",
                    "DOM.importstrings", "DOM.title"
                ],
                onBuildWrite: function(id, path, contents) {
                    return contents.replace(/^define\(.*?\{\s*"use strict";[\r\n]*([.\s\S]+)\}\);\s*$/m, "$1");
                }
            },
            compile: {
                options: {
                    wrap: {
                        startFile: "extra/script.start.fragment",
                        endFile: "extra/script.end.fragment"
                    },
                    out: function(text) {
                        // replace empty define with correct declaration
                        text = text.replace("define(\"DOM\", function(){});\n", "");
                        // write file
                        grunt.file.write(grunt.config.process("build/<%= pkg.name %>.js"), grunt.config.process(text));
                    }
                }
            }
        }
    });

    Object.keys(pkg.devDependencies).filter(gruntDeps).forEach(grunt.loadNpmTasks);

    grunt.registerTask("dev", [
        "test",
        "connect",
        "watch"
    ]);

    grunt.registerTask("test", [
        "requirejs:compile",
        "jshint",
        "jasmine:unit"
    ]);

    grunt.registerTask("default", [
        "clean",
        "copy:dist",
        "uglify"
    ]);

    grunt.registerTask("dist-test", [
        "requirejs:compile",
        "copy:publish",
        "copy:dist",
        "uglify",
        "shell:rollbackPublished",
        "clean:dist"
    ]);

    grunt.registerTask("docs", [
        "clean:jsdoc",
        "copy:readme",
        "jsdoc"
    ]);

    grunt.registerTask("speed", "Run speed suite on a specified browser", function(task, browser) {
        pkg.speed = {};
        pkg.speed.task = task;
        pkg.speed.browser = browser || "Chrome";
        grunt.task.run(["requirejs:compile", "karma:speed"]);
    });

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
            "karma:unit",
            "updateFileVersion:package.json",
            "updateFileVersion:bower.json",
            "requirejs:compile",
            "copy:publish",
            "docs",
            "shell:checkoutDocs",
            "bumpDocsBuild",
            "shell:updateDocs"
        ]);
    });
};
