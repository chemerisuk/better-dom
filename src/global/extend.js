import _ from "../util/index";
import { DOM, $Element } from "../types";
import { JSCRIPT_VERSION, WEBKIT_PREFIX, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../const";
import { StaticMethodError } from "../errors";
import ExtensionHandler from "../util/extensionhandler";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var extensions = [],
    returnTrue = () => true,
    returnFalse = () => false,
    cssText;

/**
 * Declare a live extension
 * @memberof DOM
 * @alias DOM.extend
 * @param  {String}           selector         css selector of which elements to capture
 * @param  {Boolean|Function} [condition=true] indicates if live extension should be attached or not
 * @param  {Object}           definition       live extension definition
 * @see https://github.com/chemerisuk/better-dom/wiki/Live-extensions
 * @example
 * DOM.extend("selector", {
 *     constructor: function() {
 *         // initialize component
 *     },
 *     publicMethod: function() {
 *         // ...
 *     }
 * });
 */
DOM.extend = function(selector, condition, definition) {
    if (arguments.length === 2) {
        definition = condition;
        condition = true;
    }

    if (typeof condition === "boolean") condition = condition ? returnTrue : returnFalse;
    if (typeof definition === "function") definition = {constructor: definition};

    if (!definition || typeof definition !== "object" || typeof condition !== "function") throw new StaticMethodError("extend", arguments);

    if (selector === "*") {
        _.keys(definition).forEach((methodName) => {
            $Element.prototype[methodName] = definition[methodName];
        });
    } else {
        var ext = ExtensionHandler(selector, condition, definition, extensions.length);

        extensions.push(ext);

        // initialize extension manually to make sure that all elements
        // have appropriate methods before they are used in other DOM.extend.
        // Also fixes legacy IEs when the HTC behavior is already attached
        _.each.call(DOCUMENT.querySelectorAll(selector), ext);
        // MUST be after querySelectorAll because of legacy IEs quirks
        DOM.importStyles(selector, cssText);
    }
};

/* istanbul ignore if */
if (JSCRIPT_VERSION < 10) {
    cssText = "-ms-behavior:url(" + _.getLegacyFile("htc") + ") !important";

    DOCUMENT.attachEvent("on" + CUSTOM_EVENT_TYPE, () => {
        var e = WINDOW.event;

        if (e.srcUrn === CUSTOM_EVENT_TYPE) {
            extensions.forEach((ext) => { ext(e.srcElement) });
        }
    });
} else {
    let _extend = DOM.extend;

    cssText = WEBKIT_PREFIX + "animation-name:<%= prop('DOM') %> !important;";
    cssText += WEBKIT_PREFIX + "animation-duration:1ms !important";

    DOM.extend = () => {
        // declare the fake animation on the first DOM.extend method call
        DOM.importStyles("@" + WEBKIT_PREFIX + "keyframes <%= prop('DOM') %>", "from {opacity:.99} to {opacity:1}");
        // restore original method and invoke it
        (DOM.extend = _extend).apply(DOM, arguments);
    };

    // use capturing to suppress internal animationstart events
    DOCUMENT.addEventListener(WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", (e) => {
        if (e.animationName === "<%= prop('DOM') %>") {
            extensions.forEach((ext) => { ext(e.target) });
            // this is an internal event - stop it immediately
            e.stopImmediatePropagation();
        }
    }, true);
}

export default extensions;
