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

const jscriptVersion = WINDOW.ScriptEngineMajorVersion;

// feature checks
export const JSCRIPT_VERSION = jscriptVersion && jscriptVersion();
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
// legacy browser is IE<10 and Android WebKit
// https://twitter.com/jaffathecake/status/570872103227953153
export const LEGACY_BROWSER = "visibilityState" in DOCUMENT;

/**
 * Global namespace to access the document object tree
 * @namespace DOM
 * @extends {$Document}
 */
export var DOM = new $Document(DOCUMENT);
