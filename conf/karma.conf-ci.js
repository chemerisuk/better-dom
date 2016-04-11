var fs = require("fs");

// Browsers to run on Sauce Labs
var customLaunchers = {
    sl_chrome: {
        base: "SauceLabs",
        browserName: "chrome",
        platform: "Windows 10"
    },
    sl_firefox: {
        base: "SauceLabs",
        browserName: "firefox",
        platform: "Windows 10"
    },
    el_opera_12: {
        base: "SauceLabs",
        browserName: "opera",
        platform: "Windows 7",
        version: "12"
    },
    sl_safari: {
        base: "SauceLabs",
        browserName: "safari",
        platform: "OS X 10.11"
    },
    sl_ie_11: {
        base: "SauceLabs",
        browserName: "internet explorer",
        platform: "Windows 7",
        version: "11"
    },
    sl_microsoftedge: {
        base: "SauceLabs",
        browserName: "microsoftedge",
        platform: "Windows 10"
    },
    // sl_ie_10: {
    //     base: "SauceLabs",
    //     browserName: "internet explorer",
    //     platform: "Windows 7",
    //     version: "10"
    // },
    sl_ie_8: {
        base: "SauceLabs",
        browserName: "internet explorer",
        platform: "Windows XP",
        version: "8"
    },
    // sl_ie_9: {
    //     base: "SauceLabs",
    //     browserName: "internet explorer",
    //     platform: "Windows 7",
    //     version: "9"
    // },
    sl_ios_safari: {
        base: "SauceLabs",
        browserName: "iphone",
        platform: "OS X 10.11",
        version: "9.2"
    },
    sl_android: {
        base: "SauceLabs",
        browserName: "android",
        platform: "Linux"
    },
};

module.exports = function(config) {
    // Use ENV vars on Travis and sauce.json locally to get credentials
    if (!process.env.SAUCE_USERNAME) {
        if (!fs.existsSync("sauce.json")) {
            console.log("Create a sauce.json with your credentials based on the https://github.com/saucelabs/karma-sauce-example/blob/master/sauce-sample.json file.");
            process.exit(1);
        } else {
            process.env.SAUCE_USERNAME = require("./sauce").username;
            process.env.SAUCE_ACCESS_KEY = require("./sauce").accessKey;
        }
    }

    config.set({
        basePath: "..",
        frameworks: ["jasmine"],
        singleRun: true,

        reporters: ["saucelabs"],

        colors: true,
        captureTimeout: 120000,
        logLevel: config.LOG_INFO,

        sauceLabs: {
            testName: "better-dom",
            startConnect: !process.env.TRAVIS_JOB_NUMBER,
            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
        },

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: Object.keys(customLaunchers),
        customLaunchers: customLaunchers,

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
