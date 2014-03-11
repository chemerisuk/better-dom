/**
 * Changing of element visibility support
 * @module visibility
 */
var _ = require("./utils"),
    $Element = require("./element"),
    styleAccessor = require("./styleaccessor"),
    parseTimeValue = function(value) {
        var endIndex = value.length - 1;

        return value.lastIndexOf("ms") === endIndex - 1 || value.lastIndexOf("s") !== endIndex ?
            parseFloat(value) : parseFloat(value) * 1000;
    },
    calcDuration = function(style, animation) {
        var prefix = animation ? "animation-" : "transition-",
            delay = styleAccessor.get[prefix + "delay"](style).split(","),
            duration = styleAccessor.get[prefix + "duration"](style).split(","),
            iterationCount = animation ? styleAccessor.get[prefix + "iteration-count"](style).split(",") : [];

        return Math.max.apply(Math, duration.map(function(value, index) {
            var it = iterationCount[index] || "1";
            // initial or empty value equals to 1
            return (it === "initial" ? 1 : parseFloat(it)) *
                parseTimeValue(value) + (parseTimeValue(delay[index]) || 0);
        }));
    },
    eventType = _.WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    absentStrategy = !_.LEGACY_ANDROID && _.CSS3_ANIMATIONS ? ["position", "absolute"] : ["display", "none"],
    changeVisibility = function(el, fn, callback) {
        return function() {
            el.legacy(function(node, el, index, ref) {
                var style = node.style,
                    compStyle = _.computeStyle(node),
                    isHidden = typeof fn === "function" ? fn(node) : fn,
                    completeVisibilityChange = function() {
                        if (style.visibility === "hidden") {
                            style[absentStrategy[0]] = absentStrategy[1];
                        } else {
                            style.pointerEvents = "";
                        }

                        if (callback) callback(el, index, ref);
                    };

                // requestAnimationFrame fixes several issues here:
                // 1) animation of new added elements (http://christianheilmann.com/2013/09/19/quicky-fading-in-a-newly-created-element-using-css/)
                // 2) firefox-specific animations sync quirks (because of the getComputedStyle call)
                // 3) power consuption: show/hide do almost nothing if page is not active
                _.raf(function() {
                    var duration, index, transitionProperty, transitionDelay, transitionDuration;

                    // Android 2 devices are usually slow and have a lot of the
                    // animation implementation bugs, so disable animations for them
                    if (!_.LEGACY_ANDROID && _.CSS3_ANIMATIONS) {
                        duration = Math.max(calcDuration(compStyle), calcDuration(compStyle, true));
                    }

                    if (duration) {
                        transitionProperty = styleAccessor.get["transition-property"](compStyle).split(", ");
                        transitionDuration = styleAccessor.get["transition-duration"](compStyle).split(", ");
                        transitionDelay = styleAccessor.get["transition-delay"](compStyle).split(", ");
                        // update existing visibility transition if possible
                        index = transitionProperty.indexOf("visibility");
                        if (index < 0) index = transitionProperty.length;

                        transitionProperty[index] = "visibility";
                        (isHidden ? transitionDuration : transitionDelay)[index] = "0s";
                        (isHidden ? transitionDelay : transitionDuration)[index] = duration + "ms";

                        styleAccessor.set["transition-property"](style, transitionProperty.join(", "));
                        styleAccessor.set["transition-duration"](style, transitionDuration.join(", "));
                        styleAccessor.set["transition-delay"](style, transitionDelay.join(", "));

                        node.addEventListener(eventType, function completeAnimation(e) {
                            if (e.propertyName === "visibility") {
                                e.stopImmediatePropagation(); // this is an internal event

                                node.removeEventListener(eventType, completeAnimation, false);

                                completeVisibilityChange();
                            }
                        }, false);
                    }

                    if (isHidden) {
                        // store current inline value in a private property
                        el._visibility = style[absentStrategy[0]];
                        // do not store display:none
                        if (el._visibility === "none") el._visibility = "";
                        // prevent accidental user actions during animation
                        style.pointerEvents = "none";
                    } else {
                        // restore initial property value if it exists
                        style[absentStrategy[0]] = el._visibility || "";
                    }

                    style.visibility = isHidden ? "hidden" : "visible";
                    // trigger native CSS animation
                    el.set("aria-hidden", String(isHidden));
                    // must be AFTER changing the aria-hidden attribute
                    if (!duration) completeVisibilityChange();
                });
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
