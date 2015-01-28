/* globals window, document */

import { $Document } from "./types";

// globals
export const WINDOW = window;
export const DOCUMENT = document;
export const HTML = DOCUMENT.documentElement;

// constants
export const CUSTOM_EVENT_TYPE = "dataavailable";
export const RETURN_THIS = function() { return this };
export const RETURN_TRUE = () => true;
export const RETURN_FALSE = () => false;
export const VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];

const userAgent = WINDOW.navigator.userAgent;
const jscriptVersion = WINDOW.ScriptEngineMajorVersion;

// feature checks
export const JSCRIPT_VERSION = jscriptVersion && jscriptVersion();
export const LEGACY_ANDROID = ~userAgent.indexOf("Android") && userAgent.indexOf("Chrome") < 0;
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";

/**
 * Global namespace to access the document object tree
 * @namespace DOM
 * @extends {$Document}
 */
var DOM = new $Document(DOCUMENT);

export { DOM };
