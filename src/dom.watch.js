// Inspired by trick discovered by Daniel Buchner:
// https://github.com/csuwldcat/SelectorListener

var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    SelectorMatcher = require("./selectormatcher"),
    features = require("./features"),
    watchers = [],
    processEntries = function(e, node) {
        var type = e.type,
            el = $Element(node),
            accepted = e._accepted || {};

        return function(entry, index) {
            // skip previously excluded or mismatched elements
            if (!accepted[index] && entry.accept(node)) {
                if (entry.once) {
                    if (features.CSS3_ANIMATIONS) {
                        node.addEventListener(type, entry.once, false);
                    } else {
                        node.attachEvent("on" + type, entry.once);
                    }
                }

                _.defer(function() { entry.callback(el) });
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
            _.forEach(watchers, processEntries(e, e.target));
        }
    }, false);
} else {
    link = document.querySelector("link[rel=htc]");

    if (!link) throw "You forgot to include <link rel=htc> for IE<10!";

    styles = {behavior: "url(" + link.href + ") !important"};

    document.attachEvent("ondataavailable", function() {
        var e = window.event;

        if (e.srcUrn === "dataavailable") {
            _.forEach(watchers, processEntries(e, e.srcElement));
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
    if (!features.CSS3_ANIMATIONS) {
        // do safe call of the callback for each matched element
        // if the behaviour is already attached
        DOM.findAll(selector).legacy(function(node, el) {
            if (node.behaviorUrns.length) _.defer(function() { callback(el) });
        });
    }

    var index = watchers.push({
        callback: callback,
        accept: SelectorMatcher(selector),
        selector: selector,
        once: once && function(e) {
            e = e || window.event;

            if (e.animationName === animId || e.srcUrn === "dataavailable")  {
                (e._accepted = e._accepted || {})[index] = true;
            }
        }
    });

    if (_.some(watchers, function(x) { return x.selector === selector })) {
        DOM.importStyles(selector, styles);
    }
};
