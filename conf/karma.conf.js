module.exports = function(config) {
    "use strict";

    config.set({
        basePath: "..",
        singleRun: true,
        frameworks: ["jasmine"],
        browsers: ["IE8 - WinXP"],
        coverageReporter: {
            type: "html",
            dir: "coverage/"
        }
    });
};
