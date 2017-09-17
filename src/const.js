/* globals window, document */

import { $Document } from "./types";

// globals
export const WINDOW = window;
export const HTML = document.documentElement;

// constants
export const RETURN_THIS = function() { return this };
export const RETURN_TRUE = () => true;
export const RETURN_FALSE = () => false;
export const VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];

// feature checks
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";

/**
 * Global namespace to access the document object tree
 * @namespace DOM
 * @extends {$Document}
 */
export var DOM = new $Document(document);
