module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        watch: {
            karma: {
                files: ["src/*.js", "test/spec/*.js"],
                tasks: ["jshint", "karma:server:run"] 
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
            server: {
                configFile: "test/lib/karma.conf.js",
                browsers: ["Chrome"],
                background: true
            },
            unit: {
                configFile: "test/lib/karma.conf.js",
                browsers: ["Chrome"],
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
        }
    });

    grunt.loadNpmTasks("grunt-jsdoc");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-karma");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks('grunt-build-gh-pages');
    grunt.loadNpmTasks('grunt-shell');

    // FIXME: need to get rid of several karma tasks

    grunt.registerTask("dev", [
        "jshint", // run jshint first
        "karma:unit", // start karma server
        "karma:server", // start karma server
        "watch" // watch for a file changes
    ]);
};
