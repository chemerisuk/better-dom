var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    features = require("./features"),
    animationEvents = features.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    createCallback = function(el, callback, fn) {
        return function() {
            el.set("aria-hidden", fn);

            if (callback) {
                el.each(function(el, index, ref) {
                    var transitionDelay = parseFloat(el.style("transition-duration")),
                        animationDelay = parseFloat(el.style("animation-duration"));

                    if (el.get("offsetWidth") && (transitionDelay || animationDelay)) {
                        // choose max delay
                        el.once(animationEvents[animationDelay > transitionDelay ? 0 : 1], function() {
                            callback(el, index, ref);
                        });
                    } else {
                        // use setTimeout to make a safe call
                        setTimeout(function() { callback(el, index, ref) }, 0);
                    }
                });
            }
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
DOM.importStyles("[aria-hidden=true]", "pointer-events:none; display:none" + (features.CSS3_ANIMATIONS ? "" : " !important"));
