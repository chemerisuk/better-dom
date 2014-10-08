import _ from "../util/index";
import { LEGACY_IE, WEBKIT_PREFIX, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../const";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";
import importStyles from "./importstyles";
import ExtensionHandler from "../util/extensionhandler";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var extensions = [],
    readyCallback, styles;

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

    DOCUMENT.attachEvent("on" + ExtensionHandler.EVENT_TYPE, () => {
        var e = WINDOW.event;

        if (e.srcUrn === CUSTOM_EVENT_TYPE) {
            extensions.forEach(ExtensionHandler.traverse(e.srcElement, e._skip || {}));
        }
    });
} else {
    let readyState = DOCUMENT.readyState;
    // IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
    // discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
    if (DOCUMENT.attachEvent ? readyState !== "complete" : readyState === "loading") {
        readyCallback = () => {
            // MUST check for the readyCallback to avoid double
            // initialization on window.onload event
            if (readyCallback) {
                extensions.forEach((ext) => { ext.start() });

                readyCallback = null;
            }
        };

        // use DOMContentLoaded to initialize any live extension
        // AFTER the document is completely parsed to avoid quirks
        DOCUMENT.addEventListener("DOMContentLoaded", readyCallback, false);
        // just in case the DOMContentLoaded event fails use onload
        WINDOW.addEventListener("load", readyCallback, false);
    }

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
DOM.extend = function(selector, mixins) {
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object") throw new StaticMethodError("extend", arguments);

    if (selector === "*") {
        // extending element prototype
        _.assign($Element.prototype, mixins);
    } else {
        var ext = ExtensionHandler(selector, mixins, extensions.length);

        ext.start = () => {
            // initialize extension manually to make sure that all elements
            // have appropriate methods before they are used in other DOM.extend.
            // Also fixes legacy IEs when the HTC behavior is already attached
            _.each.call(DOCUMENT.querySelectorAll(selector), ext);
            // MUST be after querySelectorAll because of legacy IEs quirks
            DOM.importStyles(selector, styles);
        };

        extensions.push(ext);

        if (!readyCallback) ext.start();
    }
};

export default extensions;
