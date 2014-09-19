/* jshint unused: false */

// globals
export var WINDOW = window;
export var DOCUMENT = WINDOW.document;
export var HTML = DOCUMENT.documentElement;

var userAgent = WINDOW.navigator.userAgent;

// feature checks
export var LEGACY_IE = DOCUMENT.attachEvent && !WINDOW.CSSKeyframesRule;
export var LEGACY_ANDROID = ~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0;
export var DOM2_EVENTS = !!DOCUMENT.addEventListener;
export var WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
export var CUSTOM_EVENT_TYPE = "dataavailable";
