var _ = require("./utils"),
    $Element = require("./element"),
    features = require("./features"),
    importStyles = require("./dom.importstyles"),
    animationEvents = features.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    createCallback = function(el, callback, fn) {
        return function() {
            el.legacy(function(node, el, index, ref) {
                var hidden = typeof fn === "function" ? fn(el) : fn,
                    transitionDelay = parseFloat(el.style("transition-duration")),
                    animationDelay = parseFloat(el.style("animation-duration")),
                    iterationCount = el.style("animation-iteration-count"),
                    completeCallback = (callback || hidden) && function() {
                        // remove temporary inline styles
                        if (hidden) el.style({ visibility: null, position: null });

                        if (callback) callback(el, index, ref);
                    };

                if (features.CSS3_ANIMATIONS && (transitionDelay || animationDelay && iterationCount !== "infinite")) {
                    if (completeCallback) {
                        // choose max delay
                        el.once(animationEvents[animationDelay > transitionDelay ? 0 : 1], completeCallback);
                    }
                } else {
                    // use setTimeout to make a safe call
                    if (completeCallback) setTimeout(completeCallback, 0);
                }

                if (hidden) {
                    // store inline styles because they'll be temporary overwritten
                    el._oldstyle = { visibility: node.style.visibility, position: node.style.position };
                    // set current styles inline to override inherited from
                    // the [aria-hidden=true] rule until the element animation ends
                    el.style(el.style(["visibility", "position"]));
                } else {
                    if (el._oldstyle) {
                        // restore inline styles
                        el.style(el._oldstyle);

                        delete el._oldstyle;
                    }
                }

                el.set("aria-hidden", hidden);
            });
        };
    },
    makeVisibilityMethod = function(name, fn) {
        return function(delay, callback) {
            var delayType = typeof delay;

            if (arguments.length === 1 && delayType === "function") {
                callback = delay;
                delay = 0;
            }

            if (delay && (delayType !== "number" || delay < 0) ||
                callback && typeof callback !== "function") {
                throw _.makeError(name, this);
            }

            callback = createCallback(this, callback, fn);

            if (delay) {
                setTimeout(callback, delay);
            } else {
                callback();
            }

            return this;
        };
    };

/**
 * Show element with optional callback and delay
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.show = makeVisibilityMethod("show", false);

/**
 * Hide element with optional callback and delay
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.hide = makeVisibilityMethod("hide", true);

/**
 * Toggle element visibility with optional callback and delay
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.toggle = makeVisibilityMethod("toggle", function(el) {
    return el.get("aria-hidden") !== "true";
});

// [aria-hidden=true] could be overriden only if browser supports animations
// pointer-events:none helps to solve accidental clicks on a hidden element
importStyles("[aria-hidden=true]",  "visibility:hidden;position:absolute");
