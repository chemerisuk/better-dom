/* jshint unused: false */
/* globals window, document */

import { keys } from "./util/index";
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
export const RETURN_THIS = function() { return this };
export const RETURN_TRUE = () => true;
export const RETURN_FALSE = () => false;

export const DOM = new $Document(DOCUMENT);

/**
 * Global namespace to access the document object tree
 * @namespace DOM
 * @extends {$Document}
 */

DOM.register = function(mixins, factory, defaultFactory) {
    var proto = defaultFactory ? $Element.prototype : $Document.prototype;

    if (factory == null) {
        factory = (methodName, strategy) => strategy;
    }

    keys(mixins).forEach((methodName) => {
        var args = [methodName].concat(mixins[methodName]);

        proto[methodName] = factory.apply(null, args);

        if (defaultFactory) {
            $NullElement.prototype[methodName] = defaultFactory.apply(null, args);
        }
    });
};
