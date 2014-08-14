module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        coverageReporter: {
            type: "html",
            dir: "coverage/"
        },
        files: [
            "./test/lib/jasmine-better-dom-matchers.js",
            "./build/better-dom.js",
            "./test/spec/*.spec.js"
        ]
    });
};
