define(["DOM", "Element"], function(DOM, DOMElement, _slice, _foldl, _some, _defer, _forEach, _uniqueId, _getComputedStyle) {
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
            watchers = [],
            startNames, computed, cssPrefix, scripts, behaviorUrl;

        if (!DOM.supports("addBehavior", "a")) {
            // use trick discovered by Daniel Buchner:
            // https://github.com/csuwldcat/SelectorListener
            startNames = ["animationstart", "oAnimationStart", "webkitAnimationStart"],
            computed = _getComputedStyle(docEl),
            cssPrefix = window.CSSKeyframesRule ? "" : (_slice(computed).join("").match(/-(moz|webkit|ms)-/) || (computed.OLink === "" && ["-o-"]))[0];

            return function(selector, callback, once) {
                var animationName = _uniqueId("DOM"),
                    cancelBubbling = function(e) {
                        if (e.animationName === animationName) e.stopPropagation();
                    },
                    watcher = function(e) {
                        var el = e.target;

                        if (e.animationName === animationName) {
                            // MUST cancelBubbling first otherwise may have
                            // unexpected calls in firefox
                            if (once) el.addEventListener(e.type, cancelBubbling, false);

                            callback(DOMElement(el));
                        }
                    },
                    animationNames = _foldl(watchers, function(res, watcher) {
                        if (watcher.selector === selector) res.push(watcher.animationName);

                        return res;
                    }, [animationName]);

                watcher.selector = selector;
                watcher.animationName = animationName;

                DOM.importStyles(
                    "@" + cssPrefix + "keyframes " + animationName,
                    "from {clip: rect(1px,auto,auto,auto)} to {clip: rect(0px,auto,auto,auto)}"
                );

                DOM.importStyles(
                    selector,
                    cssPrefix + "animation-duration:0.001s;" + cssPrefix + "animation-name:" + animationNames.join(",") + " !important"
                );

                _forEach(startNames, function(name) {
                    document.addEventListener(name, watcher, false);
                });

                watchers.push(watcher);
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
                            if (once) el.on("x(detail)", cancelCallback);

                            callback(el);
                        }
                    };

                watcher.selector = selector;

                // can't use event selector because it checks all parent elements
                DOM.on("x(detail,target)", function(canceledCallbacks, el) {
                    if (el.matches(selector)) watcher(canceledCallbacks, el);
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
