import _ from "../helpers";
import { LEGACY_IE, WEBKIT_PREFIX, DOM2_EVENTS, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../constants";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";
import importStyles from "./importstyles";
import ExtensionHandler from "../util/extensionhandler";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var extensions = [], styles,
    returnTrue = () => true,
    returnFalse = () => false,
    readyState = DOCUMENT.readyState,
    startExt = (ext) => {
        // initialize extension manually to make sure that all elements
        // have appropriate methods before they are used in other DOM.extend.
        // Also fixes legacy IEs when the HTC behavior is already attached
        _.each.call(DOCUMENT.querySelectorAll(ext.selector), ext);
        // MUST be after querySelectorAll because of legacy IEs quirks
        importStyles(ext.selector, styles);
    },
    readyCallback = () => {
        if (readyCallback) {
            extensions.forEach(startExt);

            readyCallback = false;
        }
    };

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (DOCUMENT.attachEvent ? readyState === "complete" : readyState !== "loading") {
    // fix fox #14: use setTimeout to make sure that the library is fully initialized
    setTimeout(readyCallback, 0);
} else {
    if (LEGACY_IE) {
        // in better-dom.htc we use ondocumentready event that
        // invokes a live extension after document is ready
        readyCallback = null;
    } else {
        // use DOMContentLoaded to initialize live extensions
        // only when document is completely parsed
        DOCUMENT.addEventListener("DOMContentLoaded", readyCallback, false);
    }
}

if (LEGACY_IE) {
    let link = DOCUMENT.querySelector("link[rel=htc]");

    if (link) {
        link = link.href;
    } else {
        if ("console" in WINDOW) {
            WINDOW.console.log("WARNING: In order to use live extensions in IE < 10 you have to include extra files. See <%= pkg.repository.url %>#notes-about-old-ies for details.");
        }

        let scripts = DOCUMENT.scripts;
        // trying to guess HTC file location
        link = scripts[scripts.length - 1].src.split("/");
        link = "/" + link.slice(3, link.length - 1).concat("better-dom.htc").join("/");
    }

    styles = {behavior: "url(" + link + ") !important"};

    // append behavior for HTML element to apply several legacy IE-specific fixes
    importStyles("html", styles);

    DOCUMENT.attachEvent("on" + CUSTOM_EVENT_TYPE, () => {
        var e = WINDOW.event;

        if (e.srcUrn === CUSTOM_EVENT_TYPE) {
            extensions.forEach(ExtensionHandler.traverse(e.srcElement, e._skip || {}));
        }
    });
} else {
    importStyles("@" + WEBKIT_PREFIX + "keyframes " + ExtensionHandler.ANIMATION_ID, "from {opacity:.99} to {opacity:1}");

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": ExtensionHandler.ANIMATION_ID + " !important"
    };

    DOCUMENT.addEventListener(ExtensionHandler.EVENT_TYPE, (e) => {
        if (e.animationName === ExtensionHandler.ANIMATION_ID) {
            extensions.forEach(ExtensionHandler.traverse(e.target, e._skip || {}));
        }
    }, false);
}

/**
 * Declare a live extension
 * @memberof DOM
 * @alias DOM.extend
 * @param  {String}           selector         css selector of which elements to capture
 * @param  {Boolean|Function} [condition=true] indicates if live extension should be attached or not
 * @param  {Object}           mixins           extension declatation
 * @see https://github.com/chemerisuk/better-dom/wiki/Live-extensions
 */
DOM.extend = function(selector, condition, mixins) {
    if (arguments.length === 2) {
        mixins = condition;
        condition = true;
    }

    if (typeof condition === "boolean") condition = condition ? returnTrue : returnFalse;
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object" || typeof condition !== "function") throw new StaticMethodError("extend");

    if (selector === "*") {
        // extending element prototype
        _.assign($Element.prototype, mixins);
    } else {
        var ext = ExtensionHandler(selector, condition, mixins, extensions.length);

        extensions.push(ext);

        if (!readyCallback) startExt(ext);
    }
};

export default extensions;
