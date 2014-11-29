/* jshint unused: false */

// globals
export const WINDOW = window;
export const DOCUMENT = WINDOW.document;
export const HTML = DOCUMENT.documentElement;

const userAgent = WINDOW.navigator.userAgent;
const jscriptVersion = WINDOW.ScriptEngineMajorVersion;

// feature checks
export const JSCRIPT_VERSION = jscriptVersion && jscriptVersion();
export const LEGACY_ANDROID = ~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0;
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
export const CUSTOM_EVENT_TYPE = "dataavailable";

// internal props
export const NODE_DATA = "__<%= VERSION_NUMBER %>__";
export const HANDLERS_DATA = "handlers<%= VERSION_NUMBER %>";
export const WATCHERS_DATA = "watchers<%= VERSION_NUMBER %>";
export const EXTENSIONS_DATA = "extensions<%= VERSION_NUMBER %>";
export const FRAME_DATA = "frame<%= VERSION_NUMBER %>";
