var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    // Inspired by trick discovered by Daniel Buchner:
    // https://github.com/csuwldcat/SelectorListener
    watchers = [],
    supportsAnimations = window.CSSKeyframesRule || !document.attachEvent,
    handleWatcherEntry = function(e, node) {
        return function(entry) {
            // do not execute callback if it was previously excluded
            if (_.some(e._callbacks, function(x) { return x === entry.callback })) return;

            if (entry.matcher(node)) {
                if (entry.once) {
                    if (supportsAnimations) {
                        node.addEventListener(e.type, entry.once, false);
                    } else {
                        node.attachEvent("on" + e.type, entry.once);
                    }
                }

                _.defer(function() { entry.callback($Element(node)) });
            }
        };
    },
    animId, cssPrefix, link, styles;

if (supportsAnimations) {
    animId = "DOM" + new Date().getTime();
    cssPrefix = window.WebKitAnimationEvent ? "-webkit-" : "";

    DOM.importStyles("@" + cssPrefix + "keyframes " + animId, "1% {opacity: .99}");

    styles = {
        "animation-duration": "1ms",
        "animation-name": animId + " !important"
    };

    document.addEventListener(cssPrefix ? "webkitAnimationStart" : "animationstart", function(e) {
        if (e.animationName === animId) {
            _.forEach(watchers, handleWatcherEntry(e, e.target));
        }
    }, false);
} else {
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link> with rel='htc' on your page!";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent("ondataavailable", function() {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            _.forEach(watchers, handleWatcherEntry(e, e.srcElement));
        }
    });
}

/**
 * Execute callback when element with specified selector is found in document tree
 * @memberOf DOM
 * @param {String} selector css selector
 * @param {Fuction} callback event handler
 * @param {Boolean} [once] execute callback only at the first time
 */
DOM.watch = function(selector, callback, once) {
    if (!supportsAnimations) {
        // do safe call of the callback for each matched element
        // if the behaviour is already attached
        DOM.findAll(selector).legacy(function(node, el) {
            if (node.behaviorUrns.length > 0) {
                _.defer(function() { callback(el) });
            }
        });
    }

    watchers.push({
        callback: callback,
        matcher: SelectorMatcher(selector),
        selector: selector,
        once: once && function(e) {
            if (supportsAnimations) {
                if (e.animationName !== animId) return;
            } else {
                e = window.event;

                if (e.srcUrn !== "dataavailable") return;
            }

            (e._callbacks = e._callbacks || []).push(callback);
        }
    });

    if (_.some(watchers, function(x) { return x.selector === selector })) {
        DOM.importStyles(selector, styles);
    }
};
