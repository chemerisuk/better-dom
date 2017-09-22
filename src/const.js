/* globals window, document */

// globals
export const WINDOW = window;
export const DOCUMENT = document;
export const HTML = DOCUMENT.documentElement;

// constants
export const UNKNOWN_NODE = 0;
export const ELEMENT_NODE = DOCUMENT.ELEMENT_NODE;
export const DOCUMENT_NODE = DOCUMENT.DOCUMENT_NODE;
export const RETURN_THIS = function() { return this };
export const RETURN_TRUE = () => true;
export const RETURN_FALSE = () => false;
export const VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];

// feature checks
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
