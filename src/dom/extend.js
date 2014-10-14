import _ from "../util/index";
import { JSCRIPT_VERSION, WEBKIT_PREFIX, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../const";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";
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
 * @param  {Object}           mixins           extension declatation
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
DOM.extend = function(selector, condition, mixins) {
    if (arguments.length === 2) {
        mixins = condition;
        condition = true;
    }

    if (typeof condition === "boolean") condition = condition ? returnTrue : returnFalse;
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object" || typeof condition !== "function") throw new StaticMethodError("extend", arguments);

    var ext = ExtensionHandler(selector, condition, mixins, extensions.length);

    extensions.push(ext);
    // initialize extension manually to make sure that all elements
    // have appropriate methods before they are used in other DOM.extend.
    // Also fixes legacy IEs when the HTC behavior is already attached
    _.each.call(DOCUMENT.querySelectorAll(selector), ext);
    // MUST be after querySelectorAll because of legacy IEs quirks
    DOM.importStyles(selector, cssText);
};

/* istanbul ignore if */
if (JSCRIPT_VERSION < 10) {
    let legacyScripts = _.filter.call(DOCUMENT.scripts, (script) => script.src.indexOf("better-dom-legacy.js") >= 0);

    if (legacyScripts.length < 1) {
        throw new Error("In order to use live extensions in IE < 10 you have to include extra files. See <%= pkg.repository.url %>#notes-about-old-ies for details.");
    }

    cssText = "-ms-behavior:url(" + legacyScripts[0].src.replace(".js", ".htc") + ") !important";

    DOCUMENT.attachEvent("on" + CUSTOM_EVENT_TYPE, () => {
        var e = WINDOW.event;

        if (e.srcUrn === CUSTOM_EVENT_TYPE) {
            extensions.forEach(ExtensionHandler.traverse(e.srcElement));
        }
    });
} else {
    let ANIMATION_NAME = "DOM<%= VERSION_NUMBER %>";
    let _extend = DOM.extend;

    cssText = WEBKIT_PREFIX + "animation-name:" + ANIMATION_NAME + " !important;";
    cssText += WEBKIT_PREFIX + "animation-duration:1ms !important";

    DOM.extend = () => {
        // declare the fake animation on the first DOM.extend method call
        DOM.importStyles("@" + WEBKIT_PREFIX + "keyframes " + ANIMATION_NAME, "from {opacity:.99} to {opacity:1}");
        // restore original method and invoke it
        (DOM.extend = _extend).apply(DOM, arguments);
    };

    // use capturing to suppress internal animationstart events
    DOCUMENT.addEventListener(WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", (e) => {
        if (e.animationName === ANIMATION_NAME) {
            extensions.forEach(ExtensionHandler.traverse(e.target));
            // this is an internal event - stop it immediately
            e.stopImmediatePropagation();
        }
    }, true);
}

export default extensions;
