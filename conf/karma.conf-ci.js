var fs = require('fs');

// Browsers to run on Sauce Labs
var customLaunchers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 7',
    version: '37'
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'Windows 7',
    version: '31'
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
    platform: 'Windows 7',
    version: '12'
  },
  sl_safari: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.9',
    version: '7',
    deviceName: ''
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '11'
  },
  // sl_ios_safari_7: {
  //   base: 'SauceLabs',
  //   browserName: 'iphone',
  //   platform: 'OS X 10.9',
  //   version: '7.1'
  // },
  // sl_android_4_4: {
  //   base: 'SauceLabs',
  //   browserName: 'android',
  //   platform: 'Linux',
  //   version: '4.4'
  // },
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

    reporters: ['dots', 'saucelabs'],

    // web server port
    port: 9876,
    colors: true,
    captureTimeout: 120000,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    sauceLabs: {
      testName: 'better-dom'
    },

    customLaunchers: customLaunchers,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: Object.keys(customLaunchers),
    singleRun: true
  });
};
