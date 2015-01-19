import _ from "../util/index";
import { $Element, $Document } from "../types";
import { DOM, JSCRIPT_VERSION, WEBKIT_PREFIX, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../const";
import { StaticMethodError } from "../errors";
import ExtensionHandler from "../util/extensionhandler";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var returnTrue = () => true,
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

    var mappings = this._["<%= prop('mappings') %>"];

    if (!mappings) {
        this._["<%= prop('mappings') %>"] = mappings = [];

        /* istanbul ignore if */
        if (JSCRIPT_VERSION < 10) {
            this[0].attachEvent("on" + CUSTOM_EVENT_TYPE, () => {
                var e = WINDOW.event;

                if (e.srcUrn === CUSTOM_EVENT_TYPE) {
                    mappings.forEach((ext) => { ext(e.srcElement) });
                }
            });
        } else {
            // declare the fake animation on the first DOM.extend method call
            this.importStyles("@" + WEBKIT_PREFIX + "keyframes <%= prop('DOM') %>", "from {opacity:.99} to {opacity:1}");
            // use capturing to suppress internal animationstart events
            this[0].addEventListener(WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", (e) => {
                if (e.animationName === "<%= prop('DOM') %>") {
                    mappings.forEach((ext) => { ext(e.target) });
                    // this is an internal event - stop it immediately
                    e.stopImmediatePropagation();
                }
            }, true);
        }
    }

    var ext = ExtensionHandler(selector, condition, definition, mappings.length);

    mappings.push(ext);

    // initialize extension manually to make sure that all elements
    // have appropriate methods before they are used in other DOM.extend.
    // Also fixes legacy IEs when the HTC behavior is already attached
    _.each.call(DOCUMENT.querySelectorAll(selector), ext);
    // MUST be after querySelectorAll because of legacy IEs quirks
    DOM.importStyles(selector, cssText);
};

/* istanbul ignore if */
if (JSCRIPT_VERSION < 10) {
    cssText = "-ms-behavior:url(" + _.getLegacyFile("htc") + ") !important";
} else {
    cssText = WEBKIT_PREFIX + "animation-name:<%= prop('DOM') %> !important;";
    cssText += WEBKIT_PREFIX + "animation-duration:1ms !important";
}
