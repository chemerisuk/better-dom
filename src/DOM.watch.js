define(["DOM", "Element"], function(DOM, DOMElement, _slice, _foldl, _some, _defer, _forEach, _uniqueId, _getComputedStyle, _forOwn) {
    "use strict";

    // WATCH CALLBACK
    // --------------

    /**
     * Execute callback when element with specified selector matches
     * @memberOf DOM
     * @param {String} selector css selector
     * @param {Fuction} callback event handler
     * @param {Boolean} [once] execute callback only at the first time
     * @function
     */
    DOM.watch = (function() {
        var docEl = document.documentElement,
            watchers = [], hash = {},
            computed, cssPrefix, scripts, behaviorUrl;

        if (window.CSSKeyframesRule || !DOM.supports("addBehavior", "a")) {
            // Inspired by trick discovered by Daniel Buchner:
            // https://github.com/csuwldcat/SelectorListener
            computed = _getComputedStyle(docEl),
            cssPrefix = window.CSSKeyframesRule ? "" : (_slice(computed).join("").match(/-(moz|webkit)-/) || (computed.OLink === "" && ["-o-"]))[0];

            _forEach(["animationstart", "oAnimationStart", "webkitAnimationStart"], function(name) {
                document.addEventListener(name, function(e) {
                    var entry = hash[e.animationName],
                        el = e.target;

                    if (entry) {
                        // MUST cancelBubbling first otherwise may have extra calls in firefox
                        if (entry.once) el.addEventListener(name, entry.once, false);

                        entry.callback(DOMElement(el));
                    }
                }, false);
            });

            return function(selector, callback, once) {
                var animationName = _uniqueId("DOM"),
                    animations = [animationName];

                _forOwn(hash, function(entry, key) {
                    if (entry.selector === selector) animations.push(key);
                });

                DOM.importStyles("@" + cssPrefix + "keyframes " + animationName, "1% {opacity: .99}");

                DOM.importStyles(selector, {
                    "animation-duration": "1ms",
                    "animation-name": animations.join(",") + " !important"
                });

                hash[animationName] = {
                    selector: selector,
                    callback: callback,
                    once: once && function(e) {
                        if (e.animationName === animationName) e.stopPropagation();
                    }
                };
            };
        } else {
            scripts = document.scripts,
            behaviorUrl = scripts[scripts.length - 1].getAttribute("data-htc");

            return function(selector, callback, once) {
                var haveWatcherWithTheSameSelector = function(watcher) { return watcher.selector === selector; },
                    isEqualToCallback = function(otherCallback) { return otherCallback === callback; },
                    cancelCallback = function(canceledCallbacks) { canceledCallbacks.push(callback); },
                    watcher = function(canceledCallbacks, el) {
                        // do not execute callback if it was previously excluded
                        if (!_some(canceledCallbacks, isEqualToCallback)) {
                            if (once) el.on("htc(detail)", cancelCallback);

                            callback(el);
                        }
                    };

                watcher.selector = selector;

                // can't use event selector because it checks all parent elements
                DOM.on("x(detail,target)", function(canceledCallbacks, el) {
                    if (el.is(selector)) watcher(canceledCallbacks, el);
                });

                if (_some(watchers, haveWatcherWithTheSameSelector)) {
                    // call the callback manually for each matched element
                    // because the behaviour is already attached to selector
                    // also execute the callback safely
                    _forEach(DOM.findAll(selector), function(el) {
                        _defer(function() { callback(el); });
                    });
                } else {
                    DOM.importStyles(selector, {behavior: "url(" + behaviorUrl + ")"});
                }

                watchers.push(watcher);
            };
        }
    }());
});
