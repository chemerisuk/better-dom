module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "../..",
        frameworks: ["jasmine"],
        browsers: ["Opera"],
        logLevel: config.LOG_DISABLE,
        files: [
            "./test/lib/jasmine-better-dom-matchers.js",
            "./build/better-dom-legacy.js",
            "./build/better-dom.js",
            "./test/spec/*.spec.js"
        ]
    });
};
