// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    extensions = [],
    makeExtHandler = function(e, node) {
        var type = e.type,
            el = $Element(node),
            accepted = e._accepted || {};

        return function(ext, index) {
            // skip previously excluded or mismatched elements
            if (!accepted[index] && ext.accept(node)) {
                if (features.CSS3_ANIMATIONS) {
                    node.addEventListener(type, ext.stop, false);
                } else {
                    node.attachEvent("on" + type, ext.stop);
                }

                _.defer(function() { ext(el) });
            }
        };
    },
    animId, cssPrefix, link, styles;

if (features.CSS3_ANIMATIONS) {
    animId = "DOM" + new Date().getTime();
    cssPrefix = window.WebKitAnimationEvent ? "-webkit-" : "";

    DOM.importStyles("@" + cssPrefix + "keyframes " + animId, "1% {opacity: .99}");

    styles = {
        "animation-duration": "1ms !important",
        "animation-name": animId + " !important"
    };

    document.addEventListener(cssPrefix ? "webkitAnimationStart" : "animationstart", function(e) {
        if (e.animationName === animId) {
            _.forEach(extensions, makeExtHandler(e, e.target));
        }
    }, false);
} else {
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link rel=htc> for IE<10!";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent("ondataavailable", function() {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            _.forEach(extensions, makeExtHandler(e, e.srcElement));
        }
    });
}

/**
 * Define a DOM extension
 * @memberOf DOM
 * @param  {String}          selector extension css selector
 * @param  {Object|Function} mixins   extension mixins/constructor function
 * @see https://github.com/chemerisuk/better-dom/wiki/Living-extensions
 */
DOM.extend = function(selector, mixins) {
    if (typeof mixins === "function") mixins = {constructor: mixins};

    if (!mixins || typeof mixins !== "object") throw _.makeError("extend", this);

    if (selector === "*") {
        // extending element prototype
        _.extend($Element.prototype, mixins);
    } else {
        if (!features.CSS3_ANIMATIONS) {
            // do safe call of the callback for each matched element
            // if the behaviour is already attached
            DOM.findAll(selector).legacy(function(node, el) {
                if (node.behaviorUrns.length) _.defer(function() { ext(el) });
            });
        }

        var ext = function(el) {
                _.extend(el, mixins);

                if (ctr) ctr.call(el, $Element.prototype);
            },
            index = extensions.push(ext) - 1,
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor;

        if (ctr) delete mixins.constructor;

        ext.accept = SelectorMatcher(selector);
        ext.stop = function(e) {
            e = e || window.event;

            if (e.animationName === animId || e.srcUrn === "dataavailable")  {
                (e._accepted = e._accepted || {})[index] = true;
            }
        };

        DOM.importStyles(selector, styles, true);
    }
};

module.exports = extensions;
