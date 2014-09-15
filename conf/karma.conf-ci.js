var fs = require('fs');

// Browsers to run on Sauce Labs
var customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    deviceName: ''
  },
  sl_chrome_canary: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'beta',
    deviceName: ''
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    deviceName: ''
  },
  sl_safari: {
    base: 'SauceLabs',
    browserName: 'safari',
    version: '7',
    deviceName: ''
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  sl_ie_10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '10'
  },
  el_opera_12: {
    base: 'SauceLabs',
    browserName: 'opera',
    platform: 'Windows XP',
    version: '12'
  },
  sl_ios_safari_7: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.9',
    version: '7.1'
  },
  sl_ios_safari_6: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.8',
    version: '6.1'
  },
  sl_android_4_0: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.0'
  },
  sl_android_4_4: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.4'
  }
};

module.exports = function(config) {

  // Use ENV vars on Travis and sauce.json locally to get credentials
  if (!process.env.SAUCE_USERNAME) {
    if (!fs.existsSync('sauce.json')) {
      console.log('Create a sauce.json with your credentials based on the sauce-sample.json file.');
      process.exit(1);
    } else {
      process.env.SAUCE_USERNAME = require('../sauce').username;
      process.env.SAUCE_ACCESS_KEY = require('../sauce').accessKey;
    }
  }

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '..',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        "./test/lib/jasmine-better-dom-matchers.js",
        "./build/better-dom.js",
        "./test/spec/*.spec.js"
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots', 'saucelabs'],


    // web server port
    port: 9876,

    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    sauceLabs: {
      testName: 'better-dom',
      recordScreenshots: false,
      startConnect: false,
      connectOptions: {
        tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
      }
    },
    captureTimeout: 120000,
    customLaunchers: customLaunchers,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(customLaunchers),
    singleRun: true
  });
};
