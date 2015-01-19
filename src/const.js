/* jshint unused: false */
/* globals window, document */

import _ from "./util/index";
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

export const DOM = new $Document(DOCUMENT);

/**
 * Global namespace to access the document object tree
 * @namespace DOM
 * @extends {$Element}
 */

DOM.register = function(mixins, factory, defaultFactory) {
    var proto = defaultFactory ? $Element.prototype : $Document.prototype;

    _.keys(mixins).forEach((methodName) => {
        var args = [methodName].concat(mixins[methodName]);

        proto[methodName] = factory.apply(null, args);

        if (defaultFactory) {
            $NullElement.prototype[methodName] = defaultFactory.apply(null, args);
        }
    });
};
