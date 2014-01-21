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

            if (stop) (e[_.SKIPEXT] = e[_.SKIPEXT] || {})[index] = true;
        };
    },
    makeExtHandler = function(node, skip) {
        var el = $Element(node);

        skip = skip || {};

        return function(ext, index) {
            // skip previously excluded or mismatched elements
            // make a safe call so live extensions can't break each other
            if (!skip[index] && ext.accept(node)) el.fire(ext);
        };
    };

if (_.CSS3_ANIMATIONS) {
    nativeEventType = _.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart";
    animId = _.makeRandomProp();

    importStyles("@" + _.WEBKIT_PREFIX + "keyframes " + animId, "1% {opacity: .99}");

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    document.addEventListener(nativeEventType, function(e) {
        if (e.animationName === animId) {
            _.forEach(extensions, makeExtHandler(e.target, e[_.SKIPEXT]));
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
            _.forEach(extensions, makeExtHandler(e.srcElement, e[_.SKIPEXT]));
        }
    });
}

/**
 * Declare a live extension
 * @memberOf DOM
 * @param  {String}           selector         css selector of which elements to capture
 * @param  {Boolean|Function} [condition=true] condition, to define or not
 * @param  {Object}           mixins           extension declatation
 * @see https://github.com/chemerisuk/better-dom/wiki/Live-extensions
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
        _.extend($Element.prototype, mixins);
    } else {
        var eventHandlers = _.filter(Object.keys(mixins), function(prop) { return !!reRemovableMethod.exec(prop) }),
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            index = extensions.length,
            ext = function(el, mock) {
                var node = el[_.NODE];

                if (_.CSS3_ANIMATIONS) {
                    node.addEventListener(nativeEventType, stopExt(node, index), false);
                } else {
                    node.attachEvent(nativeEventType, stopExt(node, index));
                }

                if (mock !== true && condition(el) === false) return;

                _.extend(el, mixins);

                try {
                    if (ctr) ctr.call(el);
                } finally {
                    // remove event handlers from element's interface
                    if (mock !== true) _.forEach(eventHandlers, function(prop) { delete el[prop] });
                }
            };

        if (ctr) delete mixins.constructor;

        ext.accept = SelectorMatcher(selector);
        extensions.push(ext);

        DOM.ready(function() {
            // initialize extension manually to make sure that all elements
            // have appropriate methods before they are used in other DOM.ready.
            // Also fixes legacy IEs when the HTC behavior is already attached
            DOM.findAll(selector).fire(ext);
            // Any extension should be initialized after DOM.ready
            // MUST be after DOM.findAll because of legacy IEs behavior
            importStyles(selector, styles, true);
        });
    }
};

module.exports = extensions;
