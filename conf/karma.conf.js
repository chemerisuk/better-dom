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
        }
    });
};
