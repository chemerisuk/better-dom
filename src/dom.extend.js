import _ from "./utils";
import DOM from "./dom";
import $Element from "./element";
import SelectorMatcher from "./selectormatcher";

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener
var reRemovableMethod = /^(on|do)[A-Z]/,
    extensions = [],
    returnTrue = () => true,
    returnFalse = () => false,
    nativeEventType, animId, link, styles,
    applyMixins = (obj, mixins) => {
        _.forOwn(mixins, (value, key) => {
            if (key !== "constructor") obj[key] = value;
        });
    },
    applyExtensions = (node) => {
        extensions.forEach((ext) => { if (ext.accept(node)) ext(node, true) });

        _.each.call(node.children, applyExtensions);
    },
    stopExt = (node, index) => (e) => {
        var stop;

        e = e || window.event;
        // mark extension as processed via _.SKIPEXT bitmask
        if (_.CSS3_ANIMATIONS) {
            stop = e.animationName === animId && e.target === node;
        } else {
            stop = e.srcUrn === "dataavailable" && e.srcElement === node;
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
        _.each.call(document.querySelectorAll(ext.selector), ext);
        // MUST be after querySelectorAll because of legacy IEs behavior
        DOM.importStyles(ext.selector, styles);
    },
    readyState = document.readyState,
    readyCallback = () => {
        if (readyCallback) {
            extensions.forEach(startExt);

            readyCallback = false;
        }
    };

// Catch cases where ready is called after the browser event has already occurred.
// IE10 and lower don't handle "interactive" properly... use a weak inference to detect it
// discovered by ChrisS here: http://bugs.jquery.com/ticket/12282#comment:15
if (document.attachEvent ? readyState === "complete" : readyState !== "loading") {
    // use setTimeout to make sure that the library is fully initialized
    setTimeout(readyCallback, 0);
} else {
    if (_.DOM2_EVENTS) {
        window.addEventListener("load", readyCallback, false);
        document.addEventListener("DOMContentLoaded", readyCallback, false);
    } else {
        window.attachEvent("onload", readyCallback);
        document.attachEvent("ondataavailable", () => {
            if (window.event.srcUrn === "DOMContentLoaded" && readyCallback) readyCallback();
        });
    }
}

if (_.CSS3_ANIMATIONS) {
    nativeEventType = _.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart";
    animId = "DOM" + new Date().getTime();

    setTimeout(() => DOM.importStyles("@" + _.WEBKIT_PREFIX + "keyframes " + animId, "from {opacity:.99} to {opacity:1}"), 0);

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    document.addEventListener(nativeEventType, (e) => {
        if (e.animationName === animId) {
            extensions.forEach(makeExtHandler(e.target, e._skip || {}));
        }
    }, false);
} else {
    nativeEventType = "ondataavailable";
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link rel='htc'> for IE < 10";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent(nativeEventType, () => {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            extensions.forEach(makeExtHandler(e.srcElement, e._skip || {}));
        }
    });
}

/**
 * Declare a live extension
 * @memberOf DOM
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

    if (!mixins || typeof mixins !== "object" || typeof condition !== "function") throw _.makeError("extend", true);

    if (selector === "*") {
        // extending element prototype
        applyMixins($Element.prototype, mixins);
    } else {
        var eventHandlers = Object.keys(mixins).filter((prop) => !!reRemovableMethod.exec(prop)),
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            index = extensions.length,
            ext = (node, mock) => {
                var el = $Element(node);

                if (_.CSS3_ANIMATIONS) {
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
 * @memberOf DOM
 * @param  {Mixed}        [content]  HTMLString, EmmetString
 * @param  {Object|Array} [varMap]   key/value map of variables in emmet template
 * @return {$Element} mocked instance
 */
DOM.mock = function(content, varMap) {
    return content ? DOM.create(content, varMap).legacy(applyExtensions) : new $Element();
};
