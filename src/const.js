/* globals window, document */

// globals
export const WINDOW = window;
export const HTML = document.documentElement;

// constants
export const UNKNOWN_NODE = 0;
export const ELEMENT_NODE = 1;
export const DOCUMENT_NODE = 9;
export const RETURN_THIS = function() { return this };
export const RETURN_TRUE = () => true;
export const RETURN_FALSE = () => false;
export const VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];

// feature checks
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
