var _ = require("./utils"),
    $Element = require("./element"),
    et = _.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    animationProps = ["transition-duration", "animation-duration", "animation-iteration-count"],
    changeVisibility = function(el, fn, callback) {
        return function() {
            el.legacy(function(node, el, index, ref) {
                var value = typeof fn === "function" ? fn(node) : fn,
                    styles = el.style(animationProps),
                    transitionDelay = parseFloat(styles[animationProps[0]]),
                    animationDelay = parseFloat(styles[animationProps[1]]),
                    iterationCount = parseFloat(styles[animationProps[2]]),
                    hasAnimation = iterationCount >= 1 && animationDelay || transitionDelay,
                    completeAnimation = function() {
                        // fix for quick hide/show when hiding is in progress
                        if (node.getAttribute("aria-hidden") === "true") {
                            // hide element and remove it from flow
                            node.style.visibility = "hidden";
                            node.style.position = "absolute";
                        }

                        node.style.pointerEvents = "";

                        if (callback) callback(el, index, ref);
                    };

                if (value) {
                    // store current inline value in a private property
                    el[_.DISPLAY] = node.style.position;
                } else {
                    node.style.position = el[_.DISPLAY] || "";
                }

                // set styles inline to override inherited
                node.style.visibility = "visible";

                if (_.CSS3_ANIMATIONS && hasAnimation && node.offsetWidth) {
                    // prevent accidental user actions during animation
                    node.style.pointerEvents = "none";
                    // choose max delay to determine appropriate event type
                    el.once(et[iterationCount >= 1 && animationDelay > transitionDelay ? 0 : 1], completeAnimation);
                } else {
                    // execute completeAnimation safely
                    el.fire(completeAnimation);
                }
                // trigger native CSS animation
                node.setAttribute("aria-hidden", value);
            });
        };
    },
    makeVisibilityMethod = function(name, fn) {
        return function(delay, callback) {
            var len = arguments.length,
                delayType = typeof delay;

            if (len === 1 && delayType === "function") {
                callback = delay;
                delay = 0;
            }

            if (delay && (delayType !== "number" || delay < 0) ||
                callback && typeof callback !== "function") {
                throw _.makeError(name);
            }

            callback = changeVisibility(this, fn, callback);

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
$Element.prototype.toggle = makeVisibilityMethod("toggle", function(node) {
    return node.getAttribute("aria-hidden") !== "true";
});
