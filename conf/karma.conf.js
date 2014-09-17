module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        frameworks: ["jasmine"],
        browsers: ["PhantomJS"],
        coverageReporter: {
            type: "html",
            dir: "coverage/"
        }
    });
};
