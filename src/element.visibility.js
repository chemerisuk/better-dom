var _ = require("./utils"),
    $Element = require("./element"),
    features = require("./features"),
    importStyles = require("./dom.importstyles"),
    et = features.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    animatioProps = ["transition-duration", "animation-duration", "animation-iteration-count"],
    prevDisplay = "_" + Date.now(),
    createCallback = function(el, callback, fn) {
        return function() {
            el.legacy(function(node, el, index, ref) {
                var hidden = typeof fn === "function" ? fn(el) : fn,
                    styles = el.style(animatioProps),
                    transitionDelay = parseFloat(styles[animatioProps[0]]),
                    animationDelay = parseFloat(styles[animatioProps[1]]),
                    iterationCount = parseFloat(styles[animatioProps[2]]),
                    completeCallback = function() {
                        if (hidden) {
                            // store current display value in private property
                            el[prevDisplay] = node.style.display;
                            // hide element and remove it from flow
                            node.style.display = "none";
                            node.style.visibility = "";
                        }

                        node.style.pointerEvents = "";

                        if (callback) callback(el, index, ref);
                    };

                if (features.CSS3_ANIMATIONS) {
                    // choose max delay to determine appropriate event type
                    el.once(et[iterationCount >= 1 && animationDelay > transitionDelay ? 0 : 1], completeCallback);
                } else {
                    // use setTimeout to make a safe call
                    setTimeout(completeCallback, 0);
                }

                if (hidden) {
                    // set visibility inline to override inherited from [aria-hidden=true]
                    node.style.visibility = "visible";
                } else {
                    if (!el[prevDisplay] || el[prevDisplay] === "none") el[prevDisplay] = "";

                    node.style.display = el[prevDisplay];

                    delete el[prevDisplay];
                }

                // set pointer-events:none during animation to prevent unexpected actions
                node.style.pointerEvents = "none";

                // trigger native CSS animation
                if (hidden) {
                    node.setAttribute("aria-hidden", hidden);
                } else {
                    // toggle aria-hidden async to apply inline styles above
                    // before starting an animation
                    setTimeout(function() { node.setAttribute("aria-hidden", hidden) }, 0);
                }
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
                throw _.makeError(name);
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
