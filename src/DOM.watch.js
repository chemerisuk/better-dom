define(["DOM", "Element"], function(DOM, $Element, _some, _defer, _forEach, _forOwn, SelectorMatcher, CSSRule) {
    "use strict";

    // WATCH CALLBACK
    // --------------

    /**
     * Execute callback when element with specified selector is found in document tree
     * @memberOf DOM
     * @param {String} selector css selector
     * @param {Fuction} callback event handler
     * @param {Boolean} [once] execute callback only at the first time
     * @function
     */
    DOM.watch = (function() {
        // Inspired by trick discovered by Daniel Buchner:
        // https://github.com/csuwldcat/SelectorListener

        var watchers = [],
            supportsAnimations = window.CSSKeyframesRule || !document.attachEvent,
            handleWatcherEntry = function(e, node) {
                return function(entry) {
                    // do not execute callback if it was previously excluded
                    if (_some(e.detail, function(x) { return x === entry.callback })) return;

                    if (entry.matcher.test(node)) {
                        if (entry.once) {
                            if (supportsAnimations) {
                                node.addEventListener(e.type, entry.once, false);
                            } else {
                                node.attachEvent("on" + e.type, entry.once);
                            }
                        }

                        _defer(function() { entry.callback($Element(node)) });
                    }
                };
            },
            animId, cssPrefix, link, styles;

        if (supportsAnimations) {
            animId = "DOM" + new Date().getTime();
            cssPrefix = CSSRule.KEYFRAMES_RULE ? "" : "-webkit-";

            DOM.importStyles("@" + cssPrefix + "keyframes " + animId, "1% {opacity: .99}");

            styles = {
                "animation-duration": "1ms",
                "animation-name": animId + " !important"
            };

            document.addEventListener(cssPrefix ? "webkitAnimationStart" : "animationstart", function(e) {
                if (e.animationName === animId) {
                    _forEach(watchers, handleWatcherEntry(e, e.target));
                }
            }, false);
        } else {
            link = document.querySelector("link[rel=htc]");

            if (!link) throw "You forgot to include <link> with rel='htc' on your page!";

            styles = {behavior: "url(" + link.href + ") !important"};

            document.attachEvent("ondataavailable", function() {
                var e = window.event;

                if (e.srcUrn === "dataavailable") {
                    _forEach(watchers, handleWatcherEntry(e, e.srcElement));
                }
            });
        }

        return function(selector, callback, once) {
            if (!supportsAnimations) {
                // do safe call of the callback for each matched element
                // because the behaviour is already attached to selector
                DOM.findAll(selector).each(function(el) {
                    if (el._node.behaviorUrns.length > 0) {
                        _defer(function() { callback(el) });
                    }
                });
            }

            watchers.push({
                callback: callback,
                matcher: new SelectorMatcher(selector),
                once: once && function(e) {
                    if (e) {
                        if (e.animationName !== animId) return;
                    } else {
                        e = window.event;

                        if (e.srcUrn !== "dataavailable") return;
                    }

                    (e.detail = e.detail || []).push(callback);
                }
            });

            if (_some(watchers, function(x) { return x.matcher.selector === selector })) {
                DOM.importStyles(selector, styles);
            }
        };
    }());
});
