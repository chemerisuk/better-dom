/**
 * Changing of element visibility support
 * @module visibility
 */
var _ = require("./utils"),
    $Element = require("./element"),
    styleAccessor = require("./styleaccessor"),
    eventTypes = _.WEBKIT_PREFIX ? ["webkitAnimationEnd", "webkitTransitionEnd"] : ["animationend", "transitionend"],
    absentStrategy = _.CSS3_ANIMATIONS ? ["position", "absolute"] : ["display", "none"],
    readAnimationProp = function(key, style) {
        var fn = styleAccessor.get[key];

        return fn && parseFloat(fn(style)) || 0;
    },
    changeVisibility = function(el, fn, callback) {
        return function() {
            el.legacy(function(node, el, index, ref) {
                var nodeStyle = node.style,
                    computedStyle = _.computeStyle(node),
                    value = typeof fn === "function" ? fn(node) : fn,
                    transitionDuration = readAnimationProp("transition-duration", computedStyle),
                    animationDuration = readAnimationProp("animation-duration", computedStyle),
                    iterationCount = readAnimationProp("animation-iteration-count", computedStyle),
                    duration = Math.max(iterationCount * animationDuration, transitionDuration),
                    animationType = eventTypes[duration === transitionDuration ? 1 : 0],
                    hasAnimation = _.CSS3_ANIMATIONS && duration && node.offsetWidth,
                    animationDone = function() {
                        // fix for quick hide/show when hiding is in progress
                        if (node.getAttribute("aria-hidden") === "true") {
                            // hide element and remove it from flow
                            nodeStyle.visibility = "hidden";
                            nodeStyle[absentStrategy[0]] = absentStrategy[1];
                        }

                        if (hasAnimation) node.removeEventListener(animationType, animationDone, false);

                        if (callback) {
                            callback(el, index, ref);
                            callback = null; // prevent executing the callback twise
                        }
                    };

                if (value) {
                    // store current inline value in a private property
                    el._visibility = nodeStyle[absentStrategy[0]];
                    // do not store display:none
                    if (el._visibility === "none") el._visibility = "";
                    // prevent accidental user actions during animation
                    nodeStyle.pointerEvents = "none";
                } else {
                    nodeStyle[absentStrategy[0]] = el._visibility || "";
                    // visible element should be accessable
                    nodeStyle.pointerEvents = "";
                }
                // set styles inline to override inherited
                nodeStyle.visibility = "visible";

                if (hasAnimation) {
                    // choose max delay to determine appropriate event type
                    node.addEventListener(animationType, animationDone, false);
                    // animation end event is not sometimes fired for small delays,
                    // so make sure that animationDone will be called via setTimeout
                    setTimeout(animationDone, duration + 100);
                }
                // trigger native CSS animation
                node.setAttribute("aria-hidden", value);
                // when there is no animation the animationDone call
                // must be AFTER changing the aria-hidden attribute
                if (!hasAnimation) el.dispatch(animationDone);
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
 * @memberOf module:visibility
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.show = makeVisibilityMethod("show", false);

/**
 * Hide element with optional callback and delay
 * @memberOf module:visibility
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.hide = makeVisibilityMethod("hide", true);

/**
 * Toggle element visibility with optional callback and delay
 * @memberOf module:visibility
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.toggle = makeVisibilityMethod("toggle", function(node) {
    return node.getAttribute("aria-hidden") !== "true";
});
