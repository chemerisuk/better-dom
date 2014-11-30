/* jshint unused: false */
/* globals window, document */

// globals
export const WINDOW = window;
export const DOCUMENT = document;
export const HTML = DOCUMENT.documentElement;

const userAgent = WINDOW.navigator.userAgent;
const jscriptVersion = WINDOW.ScriptEngineMajorVersion;

// feature checks
export const JSCRIPT_VERSION = jscriptVersion && jscriptVersion();
export const LEGACY_ANDROID = ~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0;
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
export const CUSTOM_EVENT_TYPE = "dataavailable";
