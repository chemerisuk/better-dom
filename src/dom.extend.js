/**
 * Live extensions support
 * @module extend
 * @see https://github.com/chemerisuk/better-dom/wiki/Live-extensions
 */

// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener
var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    importStyles = require("./dom.importstyles"),
    reRemovableMethod = /^(on|do)[A-Z]/,
    extensions = [],
    returnTrue = function() { return true },
    returnFalse = function() { return false },
    nativeEventType, animId, link, styles,
    applyMixins = function(obj, mixins) {
        _.forOwn(mixins, function(value, key) {
            if (key !== "constructor") obj[key] = value;
        });
    },
    applyExtensions = function(node) {
        extensions.forEach(function(ext) { if (ext.accept(node)) ext(node, true) });

        _.each.call(node.children, applyExtensions);
    },
    stopExt = function(node, index) {
        return function(e) {
            var stop;

            e = e || window.event;
            // mark extension as processed via _.SKIPEXT bitmask
            if (_.CSS3_ANIMATIONS) {
                stop = e.animationName === animId && e.target === node;
            } else {
                stop = e.srcUrn === "dataavailable" && e.srcElement === node;
            }

            if (stop) (e._skip = e._skip || {})[index] = true;
        };
    },
    makeExtHandler = function(node, skip) {
        return function(ext, index) {
            // skip previously excluded or mismatched elements
            if (!skip[index] && ext.accept(node)) ext(node);
        };
    };

if (_.CSS3_ANIMATIONS) {
    nativeEventType = _.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart";
    animId = "DOM" + new Date().getTime();

    importStyles("@" + _.WEBKIT_PREFIX + "keyframes " + animId, "from {opacity:.99} to {opacity:1}");

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    document.addEventListener(nativeEventType, function(e) {
        if (e.animationName === animId) {
            extensions.forEach(makeExtHandler(e.target, e._skip || {}));
        }
    }, false);
} else {
    nativeEventType = "ondataavailable";
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link rel='htc'> for IE < 10";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent(nativeEventType, function() {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            extensions.forEach(makeExtHandler(e.srcElement, e._skip || {}));
        }
    });
}

/**
 * Declare a live extension
 * @memberOf module:extend
 * @param  {String}           selector         css selector of which elements to capture
 * @param  {Boolean|Function} [condition=true] indicates if live extension should be attached or not
 * @param  {Object}           mixins           extension declatation
 */
DOM.extend = function(selector, condition, mixins) {
    if (arguments.length === 2) {
        mixins = condition;
        condition = true;
    }

    if (typeof condition === "boolean") condition = condition ? returnTrue : returnFalse;

    if (!mixins || typeof mixins !== "object" || typeof condition !== "function") throw _.makeError("extend", true);

    if (selector === "*") {
        // extending element prototype
        applyMixins($Element.prototype, mixins);
    } else {
        var eventHandlers = Object.keys(mixins).filter(function(prop) { return !!reRemovableMethod.exec(prop) }),
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            index = extensions.length,
            ext = function(node, mock) {
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
                if (mock !== true) eventHandlers.forEach(function(prop) { delete el[prop] });
            };

        ext.accept = SelectorMatcher(selector);
        extensions.push(ext);

        DOM.ready(function() {
            // initialize extension manually to make sure that all elements
            // have appropriate methods before they are used in other DOM.ready.
            // Also fixes legacy IEs when the HTC behavior is already attached
            _.each.call(document.querySelectorAll(selector), ext);
            // Any extension should be initialized after DOM.ready
            // MUST be after querySelectorAll because of legacy IEs behavior
            DOM.importStyles(selector, styles);
        });
    }
};

/**
 * Return {@link $Element} initialized with all existing live extensions.
 * Also exposes private event handler functions that aren't usually presented
 * @memberOf module:extend
 * @param  {Mixed}        [content]  HTMLString, EmmetString
 * @param  {Object|Array} [varMap]   key/value map of variables in emmet template
 * @return {$Element} mocked instance
 */
DOM.mock = function(content, varMap) {
    return content ? DOM.create(content, varMap).legacy(applyExtensions) : new $Element();
};
