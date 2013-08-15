module.exports = function(config) {
    "use strict";

    config.set({
        singleRun: true,
        basePath: "../..",
        frameworks: ["jasmine"],
        browsers: ["PhantomJS", "Chrome", "Opera", "Safari", "Firefox"],
        logLevel: config.LOG_DISABLE,
        files: [
            "test/lib/jasmine-dom/*.js",
            "node_modules/lodash/lodash.js",
            "build/*.js",
            "test/spec/*.spec.js"
        ]
    });
};
