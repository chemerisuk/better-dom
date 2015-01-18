/* jshint unused: false */
/* globals window, document */

import { $Document, $Element, $NullElement } from "./types";

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

/**
 * Global namespace to access the document object tree
 * @namespace DOM
 * @extends {$Element}
 */
export const DOM = new $Document(DOCUMENT);

DOM.extend = function(selector, mixins, defaultBehavior) {
    var objProto = $Document.prototype,
        nullProto;

    if (selector === "*") {
        objProto = $Element.prototype;
        nullProto = $NullElement.prototype;
    } else {
        defaultBehavior = mixins;
        mixins = selector;
    }

    defaultBehavior = defaultBehavior || function() {};

    Object.keys(mixins).forEach((key) => {
        var defaults = defaultBehavior(key) || function() { return this };

        objProto[key] = mixins[key];

        if (nullProto) nullProto[key] = defaults;
    });
};
