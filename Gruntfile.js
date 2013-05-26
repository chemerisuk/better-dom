module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        watch: {
            karma: {
                files: ["src/*.js", "test/spec/*.js"],
                tasks: ["karma:watch:run"]
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
                src: ["src/*.js"],
                options: {
                    destination: "jsdoc"
                }
            }
        },

        karma: {
            watch: {
                configFile: "test/lib/karma.conf.js",
                background: true,
                reporters: ["coverage", "progress"],
                preprocessors: {
                    "src/*.js": "coverage"
                }
            },
            unit: {
                configFile: "test/lib/karma.conf.js",
                browsers: ["Chrome", "Opera", "Safari", "Firefox", "PhantomJS"],
                singleRun: true
            },
            travis: {
                configFile: "test/lib/karma.conf.js",
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
                    "ls | grep -v ^jsdoc$ | grep -v ^node_modules$ | xargs rm -r ",

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
                    "git push --tags v<%= pkg.version %>"
                ].join(" && "),
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            openCoverage: {
                command: "open coverage/PhantomJS\\ 1.9\\ \\(Mac\\)/index.html"
            },
            openJsdoc: {
                command: "open jsdoc/index.html"
            }
        },

        clean: {
            dist: ["dist/"]
        },

        copy: {
            dist: {
                files: {
                    "dist/<%= pkg.name %>-<%= pkg.version %>.htc": ["src/*.htc"],
                    "dist/<%= pkg.name %>-<%= pkg.version %>.js": ["src/*.js"]
                }
            }
        },

        uglify: {
            dist: {
                options: {
                    preserveComments: "some",
                    report: "min"
                },
                files: {
                    "dist/<%= pkg.name %>-<%= pkg.version %>.min.js": ["src/*.js"]
                }
            }
        },

        concat: {
            options: {
                banner: [
                    "/**",
                    " * @file <%= pkg.name %>",
                    " * @version <%= pkg.version %>",
                    " * @overview <%= pkg.description %>",
                    " * @copyright <%= pkg.author %> 2013",
                    " * @license MIT",
                    " * @see <%= pkg.repository.url %>",
                    " */\n"
                ].join("\n"),
                stripBanners: true
            },
            publish: {
                src: "src/<%= pkg.name %>.js",
                dest: "src/<%= pkg.name %>.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");


    grunt.registerTask("dev", [
        "jshint", // run jshint first
        "shell:openCoverage", // open coverage page
        "karma:watch", // start karma server
        "watch" // watch for a file changes
    ]);

    grunt.registerTask("test", [
        "jshint",
        "karma:unit"
    ]);

    grunt.registerTask("default", [
        "clean",
        "copy:dist",
        "uglify:dist"
    ]);

    grunt.registerTask("travis", [
        "jshint",
        "karma:travis"
    ]);

    grunt.registerTask("docs", [
        "jsdoc",
        "shell:openJsdoc"
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
            "test",
            "updateFileVersion:package.json",
            "updateFileVersion:bower.json",
            "concat:publish",
            "jsdoc",
            "shell:checkoutDocs",
            "bumpDocsBuild",
            "shell:updateDocs"
        ]);
    });
};
