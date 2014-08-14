import _ from "../helpers";
import { CSS3_ANIMATIONS, WEBKIT_PREFIX, DOM2_EVENTS, WINDOW, DOCUMENT, CUSTOM_EVENT_TYPE } from "../constants";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";
import SelectorMatcher from "../util/selectormatcher";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener
var reRemovableMethod = /^(on|do)[A-Z]/,
    extensions = [],
    returnTrue = () => true,
    returnFalse = () => false,
    nativeEventType, animId, link, styles,
    applyMixins = (obj, mixins) => {
        _.keys(mixins).forEach((key) => {
            if (key !== "constructor") obj[key] = mixins[key];
        });
    },
    applyExtensions = (node) => {
        extensions.forEach((ext) => { if (ext.accept(node)) ext(node, true) });

        _.each.call(node.children, applyExtensions);
    },
    stopExt = (node, index) => (e) => {
        var stop;

        e = e || WINDOW.event;
        // mark extension as processed via _.SKIPEXT bitmask
        if (CSS3_ANIMATIONS) {
            stop = e.animationName === animId && e.target === node;
        } else {
            stop = e.srcUrn === CUSTOM_EVENT_TYPE && e.srcElement === node;
        }

        if (stop) (e._skip = e._skip || {})[index] = true;
    },
    makeExtHandler = (node, skip) => (ext, index) => {
        // skip previously excluded or mismatched elements
        if (!skip[index] && ext.accept(node)) ext(node);
    },
    startExt = (ext) => {
        // initialize extension manually to make sure that all elements
        // have appropriate methods before they are used in other DOM.extend.
        // Also fixes legacy IEs when the HTC behavior is already attached
        _.each.call(DOCUMENT.querySelectorAll(ext.selector), ext);
        // MUST be after querySelectorAll because of legacy IEs behavior
        DOM.importStyles(ext.selector, styles);
    },
    readyState = DOCUMENT.readyState,
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
    // use setTimeout to make sure that the library is fully initialized
    setTimeout(readyCallback, 0);
} else {
    if (DOM2_EVENTS) {
        WINDOW.addEventListener("load", readyCallback, false);
        DOCUMENT.addEventListener("DOMContentLoaded", readyCallback, false);
    } else {
        WINDOW.attachEvent("onload", readyCallback);
        DOCUMENT.attachEvent("ondataavailable", () => {
            if (WINDOW.event.srcUrn === "DOMContentLoaded" && readyCallback) readyCallback();
        });
    }
}

if (CSS3_ANIMATIONS) {
    nativeEventType = WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart";
    animId = "DOM" + Date.now();

    setTimeout(() => DOM.importStyles("@" + WEBKIT_PREFIX + "keyframes " + animId, "from {opacity:.99} to {opacity:1}"), 0);

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    DOCUMENT.addEventListener(nativeEventType, (e) => {
        if (e.animationName === animId) {
            extensions.forEach(makeExtHandler(e.target, e._skip || {}));
        }
    }, false);
} else {
    nativeEventType = "ondataavailable";
    link = DOCUMENT.querySelector("link[rel=htc]");

    if (!link) throw "In order to use live extensions you have to include link[rel=htc] for IE < 10";

    styles = {behavior: "url(" + link.href + ") !important"};

    DOCUMENT.attachEvent(nativeEventType, () => {
        var e = WINDOW.event;

        if (e.srcUrn === CUSTOM_EVENT_TYPE) {
            extensions.forEach(makeExtHandler(e.srcElement, e._skip || {}));
        }
    });
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
        applyMixins($Element.prototype, mixins);
    } else {
        var eventHandlers = _.keys(mixins).filter((prop) => !!reRemovableMethod.exec(prop)),
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            index = extensions.length,
            ext = (node, mock) => {
                var el = $Element(node);

                if (CSS3_ANIMATIONS) {
                    node.addEventListener(nativeEventType, stopExt(node, index), false);
                } else {
                    node.attachEvent(nativeEventType, stopExt(node, index));
                }

                if (mock !== true && condition(el) === false) return;

                applyMixins(el, mixins);
                // make a safe call so live extensions can't break each other
                if (ctr) el.dispatch(ctr);
                // remove event handlers from element's interface
                if (mock !== true) eventHandlers.forEach((prop) => { delete el[prop] });
            };

        ext.accept = SelectorMatcher(selector);
        ext.selector = selector;
        extensions.push(ext);

        if (!readyCallback) startExt(ext);
    }
};

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberof DOM
 * @alias DOM.mock
 * @param  {HTMLString} [content] string to mock
 * @return {$Element} mocked instance
 */
DOM.mock = function(content, varMap) {
    if (!content) return new $Element();

    var result = DOM.create(content, varMap);

    _.each.call(result, (el) => { el.each((_, node) => { applyExtensions(node) }) });

    return result;
};
