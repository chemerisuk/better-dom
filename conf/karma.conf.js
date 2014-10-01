module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        singleRun: true,
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        coverageReporter: {
            type: "html",
            dir: "coverage/"
        },
        files: [
            // legacy IE file includes
            {pattern: "./build/better-dom.htc", served: true, included: false},
            "./bower_components/es5-shim/es5-shim.js",
            "./bower_components/html5shiv/dist/html5shiv.js",
            // normal browser file includes
            "./test/lib/jasmine-better-dom-matchers.js",
            "./build/better-dom.js",
            "./test/spec/**/*.spec.js"
        ]
    });
};
