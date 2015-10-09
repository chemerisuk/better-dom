module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        singleRun: true,
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        preprocessors: { "build/better-dom.js": "coverage" },
        coverageReporter: {
            type: "html",
            dir: "coverage/"
        },
        files: [
            // legacy IE file includes
            {pattern: "./build/better-dom-legacy.htc", served: true, included: false},
            "./build/better-dom-legacy.js",
            // normal browser file includes
            "./test/lib/jasmine-better-dom-matchers.js",
            "./build/better-dom.js",
            "./test/spec/**/*.spec.js"
        ]
    });
};
