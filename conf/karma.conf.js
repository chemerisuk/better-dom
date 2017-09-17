module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        singleRun: true,
        frameworks: ["jasmine"],
        browsers: ["ChromeHeadless"],
        preprocessors: { "build/better-dom.js": "coverage" },
        coverageReporter: {
            type: "html",
            dir: "coverage/"
        },
        files: [
            "./test/lib/jasmine-better-dom-matchers.js",
            "./build/better-dom.js",
            "./test/spec/**/*.spec.js"
        ]
    });
};
