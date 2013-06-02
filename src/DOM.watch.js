define(["DOM", "Element"], function(DOM, DOMElement, supports) {
    "use strict";

    /**
     * Execute callback when element with specified selector matches
     * @memberOf DOM
     * @param {String} selector css selector
     * @param {Fuction} callback event handler
     * @param {Boolean} [once] execute callback only at the first time
     * @function
     */
    DOM.watch = (function() {
        DOM._watchers = [];

        if (supports("addBehavior", "a")) {
            var scripts = document.scripts,
                behaviorUrl = scripts[scripts.length - 1].getAttribute("data-htc");

            return function(selector, callback, once) {
                var hasWatcherWithTheSameSelector = function(watcher) { return watcher.selector === selector; },
                    isNotEqualToCallback = function(otherCallback) { return otherCallback !== callback; },
                    cancelCallback = function(canceledCallbacks) { canceledCallbacks.push(callback); },
                    watcher = function(canceledCallbacks, el) {
                        if (once) el.on("htc:watch", ["detail"], cancelCallback);

                        // do not execute callback if it was previously excluded
                        if (_.every(canceledCallbacks, isNotEqualToCallback)) {
                            callback(el);
                        }
                    };

                watcher.selector = selector;

                this.on("htc:watch " + selector, ["detail", "target"], watcher);

                if (_.some(this._watchers, hasWatcherWithTheSameSelector)) {
                    // call the callback manually for each matched element
                    // because the behaviour is already attached to selector
                    this.findAll(selector).each(callback);
                } else {
                    DOM.importStyles(selector, { behavior: "url(" + behaviorUrl + ")" });
                }

                this._watchers.push(watcher);
            };
        } else {
            // use trick discovered by Daniel Buchner:
            // https://github.com/csuwldcat/SelectorListener
            var startNames = ["animationstart", "oAnimationStart", "webkitAnimationStart"],
                computed = getComputedStyle(document.documentElement),
                cssPrefix = window.CSSKeyframesRule ? "" : (_.slice(computed).join("").match(/-(moz|webkit|ms)-/) || (computed.OLink === "" && ["-o-"]))[0];

            return function(selector, callback, once) {
                var animationName = _.uniqueId("DOM"),
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
                    animationNames = _.reduce(this._watchers, function(res, watcher) {
                        if (watcher.selector === selector) res.push(watcher.animationName);

                        return res;
                    }, [animationName]);

                watcher.selector = selector;
                watcher.animationName = animationName;

                DOM.importStyles(
                    "@" + cssPrefix + "keyframes " + animationName,
                    "from { clip: rect(1px, auto, auto, auto) } to { clip: rect(0px, auto, auto, auto) }"
                );

                DOM.importStyles(
                    selector,
                    cssPrefix + "animation-duration:0.001s;" + cssPrefix + "animation-name:" + animationNames.join(",") + " !important"
                );

                _.forEach(startNames, function(name) {
                    this._node.addEventListener(name, watcher, false);
                }, this);

                this._watchers.push(watcher);
            };
        }
    })();
});