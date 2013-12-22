// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    reEventHandler = /^on[A-Z]/,
    extensions = [],
    makeExtHandler = function(e, node) {
        var type = e.type,
            el = $Element(node),
            accepted = e._done || {};

        return function(ext, index) {
            // skip previously excluded or mismatched elements
            if (!accepted[index] && ext.accept(node)) {
                if (features.CSS3_ANIMATIONS) {
                    node.addEventListener(type, ext.stop, false);
                } else {
                    node.attachEvent("on" + type, ext.stop);
                }

                setTimeout(function() { ext(el) }, 0);
            }
        };
    },
    animId, link, styles;

if (features.CSS3_ANIMATIONS) {
    animId = "DOM" + new Date().getTime();

    DOM.importStyles("@" + features.WEBKIT_PREFIX + "keyframes " + animId, "1% {opacity: .99}");

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    document.addEventListener(features.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", function(e) {
        if (e.animationName === animId) {
            _.forEach(extensions, makeExtHandler(e, e.target));
        }
    }, false);
} else {
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link rel='htc'> for IE < 10";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent("ondataavailable", function() {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            _.forEach(extensions, makeExtHandler(e, e.srcElement));
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

                if (ctr) ctr.call(el);
                // cleanup event handlers
                if (!mock) _.forEach(eventHandlers, function(prop) { delete el[prop] });
            },
            index = extensions.push(ext) - 1,
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor;

        if (ctr) delete mixins.constructor;

        ext.accept = SelectorMatcher(selector);
        ext.stop = function(e) {
            e = e || window.event;

            if (e.animationName === animId || e.srcUrn === "dataavailable")  {
                // mark extension as processed via _done bitmask
                (e._done = e._done || {})[index] = true;
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
                    e.initEvent(features.WEBKIT_PREFIX ? "webkitAnimationStart" : "animationstart", true, true);
                    e.animationName = animId;

                    node.dispatchEvent(e);
                } else {
                    e = document.createEventObject();
                    e.srcUrn = "dataavailable";
                    node.fireEvent("ondataavailable", e);
                }
            });
            // make sure that any extension is initialized after DOM.ready
            // MUST be after DOM.findAll because of legacy IE behavior
            DOM.importStyles(selector, styles, true);
        });
    }
};

module.exports = extensions;
