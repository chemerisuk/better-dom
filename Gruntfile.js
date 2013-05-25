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
                dest: "docs"
            }
        },

        karma: {
            watch: {
                configFile: "test/lib/karma.conf.js",
                browsers: ["Chrome"],
                background: true
            },
            unit: {
                configFile: "test/lib/karma.conf.js",
                browsers: ["Chrome", "Opera", "Safari", "Firefox", "PhantomJS"],
                singleRun: true
            },
            travis: {
                configFile: "test/lib/karma.conf.js",
                browsers: ["PhantomJS"],
                singleRun: true
            }
        },

        shell: {
            checkVersionTag: {
                command: "git tag -a v<%= pkg.version %> -m ''",
                options: { failOnError: true }
            },
            updateVersionTag: {
                command: "git tag -af v<%= pkg.version %> -m 'version <%= pkg.version %>'"
            },
            commitNewVersion: {
                command: "git commit -am 'version <%= pkg.version %>'"
            },
            checkoutDocs: {
                command: "git checkout gh-pages"
            },
            updateDocs: {
                command: [
                    // get a list of all files in stage and delete everything except for targets, node_modules, cache, temp, and logs
                    // rm does not delete root level hidden files
                    "ls | grep -v ^docs$ | grep -v ^node_modules$ | xargs rm -r ",

                    // copy from the stage folder to the current (root) folder
                    "cp -r docs/* . && rm -r docs",

                    // add any files that may have been created
                    "git add -A",

                    // commit all files using the version number as the commit message
                    "git commit -am 'Build: <%= grunt.file.read(\".build\") %>'",

                    // switch back to the previous branch we started from
                    "git checkout -"
                ].join(" && "),
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            pushTag: {
                command: "git push origin -all && git push --tags v<%= pkg.version %>"
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
            "shell:commitNewVersion",
            "jsdoc",
            "shell:checkoutDocs",
            "bumpDocsBuild",
            "shell:updateDocs",
            "shell:updateVersionTag",
            "shell:pushTag"
        ]);
    });
};
