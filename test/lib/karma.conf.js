module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "../..",
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        files: [
            "./test/lib/jasmine-better-dom-matchers.js",
            "./build/better-dom-legacy.js",
            "./build/better-dom.js",
            "./test/spec/*.spec.js"
        ]
    });
};
