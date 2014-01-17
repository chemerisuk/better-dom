var _ = require("./utils"),
    $Element = require("./element"),
    features = require("./features"),
    et = features.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    animatioProps = ["transition-duration", "animation-duration", "animation-iteration-count"],
    prevDisplayValue = "_" + Date.now(),
    makeVisibilityMethod = function(name, fn) {
        return function(delay, callback) {
            var delayType = typeof delay;

            if (arguments.length === 1 && delayType === "function") {
                callback = delay;
                delay = 0;
            }

            if (delay && (delayType !== "number" || delay < 0) ||
                callback && typeof callback !== "function") {
                throw _.makeError(name);
            }

            return this.legacy(function(node, el, index, ref) {
                var hidden = typeof fn === "function" ? fn(node) : fn,
                    styles = el.style(animatioProps),
                    transitionDelay = parseFloat(styles[animatioProps[0]]),
                    animationDelay = parseFloat(styles[animatioProps[1]]),
                    iterationCount = parseFloat(styles[animatioProps[2]]),
                    hasAnimation = transitionDelay || iterationCount >= 1 && animationDelay,
                    completeCallback = function() {
                        if (hidden) {
                            // store current display value in private property
                            el[prevDisplayValue] = node.style.display;
                            // hide element and remove it from flow
                            node.style.display = "none";
                            node.style.visibility = "";
                        }

                        node.style.pointerEvents = "";

                        if (callback) callback(el, index, ref);
                    };

                if (features.CSS3_ANIMATIONS && hasAnimation) {
                    // choose max delay to determine appropriate event type
                    el.once(et[iterationCount >= 1 && animationDelay > transitionDelay ? 0 : 1], completeCallback);
                } else {
                    // use setTimeout to make a safe call when there is no animation
                    setTimeout(completeCallback, 0);
                }

                if (hidden) {
                    // set visibility inline to override inherited from [aria-hidden=true]
                    node.style.visibility = "visible";
                } else {
                    if (!el[prevDisplayValue] || el[prevDisplayValue] === "none") el[prevDisplayValue] = "";

                    node.style.display = el[prevDisplayValue];

                    delete el[prevDisplayValue];
                }

                // set pointer-events:none during animation to prevent unexpected actions
                node.style.pointerEvents = "none";

                // trigger native CSS animation
                if (hasAnimation || delay) {
                    // toggle aria-hidden async to apply inline styles before the animation start
                    setTimeout(function() { node.setAttribute("aria-hidden", hidden) }, delay);
                } else {
                    node.setAttribute("aria-hidden", hidden);
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
