var _ = require("./utils"),
    $Element = require("./element"),
    et = _.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    animationProps = ["transition-duration", "animation-duration", "animation-iteration-count"],
    prevDisplayValue = "_" + Date.now(),
    makeVisibilityMethod = function(name, fn) {
        return function(delay, callback) {
            var len = arguments.length,
                delayType = typeof delay;

            if (len === 1 && delayType === "function") {
                callback = delay;
                delay = 0;
            } else if (len === 0) {
                delay = 0;
            }

            if (delay && (delayType !== "number" || delay < 0) ||
                callback && typeof callback !== "function") {
                throw _.makeError(name);
            }

            return this.legacy(function(node, el, index, ref) {
                var value = typeof fn === "function" ? fn(node) : fn,
                    styles = el.style(animationProps),
                    transitionDelay = parseFloat(styles[animationProps[0]]),
                    animationDelay = parseFloat(styles[animationProps[1]]),
                    iterationCount = parseFloat(styles[animationProps[2]]),
                    hasAnimation = iterationCount >= 1 && animationDelay || transitionDelay,
                    completeCallback = function() {
                        if (value) {
                            // hide element and remove it from flow
                            node.style.display = "none";
                            node.style.visibility = "";
                        }

                        node.style.pointerEvents = "";

                        if (callback) callback(el, index, ref);
                    };

                if (value) {
                    // store current display value in private property
                    el[prevDisplayValue] = node.style.display;
                } else {
                    if (!el[prevDisplayValue] || el[prevDisplayValue] === "none") el[prevDisplayValue] = "";

                    node.style.display = el[prevDisplayValue];

                    delete el[prevDisplayValue];
                }

                // set inline styles to override inherited
                node.style.display = "inherit";
                node.style.visibility = "visible";
                // prevent accidental user actions
                node.style.pointerEvents = "none";

                if (_.CSS3_ANIMATIONS && hasAnimation) {
                    // choose max delay to determine appropriate event type
                    el.once(et[iterationCount >= 1 && animationDelay > transitionDelay ? 0 : 1], completeCallback);
                } else {
                    // execute completeCallback safely
                    el.fire(completeCallback);
                }
                // trigger native CSS animation
                if (hasAnimation || delay) {
                    // toggle aria-hidden async to apply inline styles before the animation starts
                    setTimeout(function() { node.setAttribute("aria-hidden", value) }, delay);
                } else {
                    node.setAttribute("aria-hidden", value);
                }
            });
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
