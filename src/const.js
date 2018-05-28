/* globals window, document */

// globals
export const WINDOW = window;
export const DOCUMENT = document;
export const HTML = DOCUMENT.documentElement;

// constants
export const UNKNOWN_NODE = 0;
export const ELEMENT_NODE = DOCUMENT.ELEMENT_NODE;
export const DOCUMENT_NODE = DOCUMENT.DOCUMENT_NODE;
export const VENDOR_PREFIXES = ["Webkit", "O", "Moz", "ms"];
export const FAKE_ANIMATION_NAME = "v<%= prop() %>";
export const SHEET_PROP_NAME = "<%= prop() %>sheet";

// feature checks
export const WEBKIT_PREFIX = WINDOW.WebKitAnimationEvent ? "-webkit-" : "";
