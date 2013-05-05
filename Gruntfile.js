module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        watch: {
            karma: {
                files: ["src/*.js", "test/spec/*.js"],
                tasks: [/*"jshint", */"karma:watch:run"] 
            }
        },

        jshint: {
            all: ["src/*.js", "test/spec/*.js"],
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
                browsers: ["Chrome", "Opera", "Safari", "Firefox"],
                singleRun: true
            }
        },

        build_gh_pages: {
            jsdoc: {
                options: {
                    dist: "docs",
                    pull: false
                }
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
        }
    });

    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-build-gh-pages");
    grunt.loadNpmTasks("grunt-shell");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask("dev", [
        "jshint", // run jshint first
        "karma:watch", // start karma server
        "watch" // watch for a file changes
    ]);

    grunt.registerTask("test", [
        "jshint",
        "karma:unit"
    ]);

    grunt.registerTask("publish-docs", [
        "jsdoc",
        "build_gh_pages:jsdoc"
    ]);

    grunt.registerTask("default", [
        "clean",
        "copy:dist",
        "uglify:dist"
    ]);
};
