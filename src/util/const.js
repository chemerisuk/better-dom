/* jshint unused: false */

// globals
export var doc = document;
export var win = window;
export var docEl = doc.documentElement;

var userAgent = win.navigator.userAgent;

// feature checks
export var CSS3_ANIMATIONS = win.CSSKeyframesRule || !doc.attachEvent;
export var LEGACY_ANDROID = ~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0;
export var DOM2_EVENTS = !!doc.addEventListener;
export var WEBKIT_PREFIX = win.WebKitAnimationEvent ? "-webkit-" : "";
