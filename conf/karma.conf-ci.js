const fs = require("fs");
const TEST_WIN_VERSION = "Windows 10";
const TEST_WIN_LEGACY_VERSION = "Windows 7";
const TEST_OSX_VERSION = "MacOS 10.13";

// Browsers to run on Sauce Labs
var customLaunchers = {
    sl_chrome: {
        base: "SauceLabs",
        browserName: "chrome",
        platform: TEST_WIN_VERSION
    },
    sl_firefox: {
        base: "SauceLabs",
        browserName: "firefox",
        platform: TEST_WIN_VERSION
    },
    // el_opera_12: {
    //     base: "SauceLabs",
    //     browserName: "opera",
    //     platform: TEST_WIN_LEGACY_VERSION,
    //     version: "12"
    // },
    sl_safari: {
        base: "SauceLabs",
        browserName: "safari",
        platform: TEST_OSX_VERSION
    },
    sl_ie_11: {
        base: "SauceLabs",
        browserName: "internet explorer",
        platform: TEST_WIN_LEGACY_VERSION,
        version: "11"
    },
    sl_microsoftedge: {
        base: "SauceLabs",
        browserName: "microsoftedge",
        platform: TEST_WIN_VERSION
    },
    sl_ie_10: {
        base: "SauceLabs",
        browserName: "internet explorer",
        platform: TEST_WIN_LEGACY_VERSION,
        version: "10"
    },
    // sl_ie_8: {
    //     base: "SauceLabs",
    //     browserName: "internet explorer",
    //     platform: "Windows XP",
    //     version: "8"
    // },
    // sl_ie_9: {
    //     base: "SauceLabs",
    //     browserName: "internet explorer",
    //     platform: TEST_WIN_LEGACY_VERSION,
    //     version: "9"
    // },
    sl_ios_safari: {
        base: "SauceLabs",
        browserName: "iphone",
        platform: TEST_OSX_VERSION,
        version: "11.2"
    },
    sl_android: {
        base: "SauceLabs",
        browserName: "android",
        platform: "Linux"
    }
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
            // normal browser file includes
            "./test/lib/jasmine-better-dom-matchers.js",
            "./build/better-dom.js",
            "./test/spec/**/*.spec.js"
        ]
    });
};
