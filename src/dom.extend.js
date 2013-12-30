// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    reEventHandler = /^on[A-Z]/,
    extensions = [],
    safeEventType = "onfilterchange",
    nativeEventType, animId, link, styles,
    makeExtHandler = function(node, skip) {
        var el = $Element(node);

        skip = skip || {};

        return function(ext, index) {
            // skip previously excluded or mismatched elements
            if (!skip[index] && ext.accept(node)) {
                if (features.CSS3_ANIMATIONS) {
                    node.addEventListener(nativeEventType, ext.stop, false);
                } else {
                    node.attachEvent(nativeEventType, ext.stop);
                }

                var e, handler = function() { ext(el) };
                // every extension executes in event handler function
                // so they can't break each other
                if (features.CSS3_ANIMATIONS) {
                    e = document.createEvent("HTMLEvents");
                    e.initEvent(safeEventType, false, false);
                    node.addEventListener(safeEventType, handler, false);
                    node.dispatchEvent(e);
                    node.removeEventListener(safeEventType, handler);
                } else {
                    node.attachEvent(safeEventType, handler);
                    node.fireEvent(safeEventType);
                    node.detachEvent(safeEventType, handler);
                }
            }
        };
    };

if (features.CSS3_ANIMATIONS) {
    nativeEventType = features.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart";
    animId = "DOM" + new Date().getTime();

    DOM.importStyles("@" + features.WEBKIT_PREFIX + "keyframes " + animId, "1% {opacity: .99}");

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    document.addEventListener(nativeEventType, function(e) {
        if (e.animationName === animId) {
            _.forEach(extensions, makeExtHandler(e.target, e._skip));
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
            _.forEach(extensions, makeExtHandler(e.srcElement, e._skip));
        }
    });
}

/**
 * Define a live extension
 * @memberOf DOM
 * @param  {String}          selector extension css selector
 * @param  {Object|Function} mixins   extension mixins or just a constructor function
 * @see https://github.com/chemerisuk/better-dom/wiki/Live-extensions
 */
DOM.extend = function(selector, mixins) {
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object") throw _.makeError("extend", this);

    if (selector === "*") {
        // extending element prototype
        _.extend($Element.prototype, mixins);
    } else {
        var eventHandlers = _.filter(Object.keys(mixins), function(prop) { return !!reEventHandler.exec(prop) }),
            ext = function(el, mock) {
                _.extend(el, mixins);

                try {
                    if (ctr) ctr.call(el);
                } finally {
                    // remove event handlers from element's interface
                    if (!mock) _.forEach(eventHandlers, function(prop) { delete el[prop] });
                }
            },
            index = extensions.push(ext) - 1,
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor;

        if (ctr) delete mixins.constructor;

        ext.accept = SelectorMatcher(selector);
        ext.stop = function(e) {
            e = e || window.event;

            if (e.animationName === animId || e.srcUrn === "dataavailable")  {
                // mark extension as processed via _skip bitmask
                (e._skip = e._skip || {})[index] = true;
            }
        };

        DOM.ready(function() {
            // initialize extension manually to make sure that all elements
            // have appropriate methods before they are used in other DOM.ready.
            // Also fixes legacy IE in case when the behaviour is already attached
            DOM.findAll(selector).legacy(function(node) {
                var e;

                if (features.CSS3_ANIMATIONS) {
                    e = document.createEvent("HTMLEvents");
                    e.initEvent(nativeEventType, true, true);
                    e.animationName = animId;

                    node.dispatchEvent(e);
                } else {
                    e = document.createEventObject();
                    e.srcUrn = "dataavailable";
                    node.fireEvent(nativeEventType, e);
                }
            });
            // make sure that any extension is initialized after DOM.ready
            // MUST be after DOM.findAll because of legacy IE behavior
            DOM.importStyles(selector, styles, true);
        });
    }
};

module.exports = extensions;
