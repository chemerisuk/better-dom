/**
 * Changing of element visibility support
 * @module visibility
 */
var _ = require("./utils"),
    $Element = require("./element"),
    styleAccessor = require("./styleaccessor"),
    eventType = _.WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    // Android 2 devices are usually slow and have a lot of
    // the implementation bugs, so disable animations for them
    absentStrategy = !_.LEGACY_ANDROID && _.CSS3_ANIMATIONS ? ["position", "absolute"] : ["display", "none"],
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
    setTransitionProperty = styleAccessor.set["transition-property"],
    setTransitionDelay = styleAccessor.set["transition-delay"],
    setTransitionDuration = styleAccessor.set["transition-duration"],
    getTransitionProperty = styleAccessor.get["transition-property"],
    getTransitionDelay = styleAccessor.get["transition-delay"],
    getTransitionDuration = styleAccessor.get["transition-duration"],
    changeVisibility = function(el, fn, callback) {
        return function() {
            el.legacy(function(node, el, index, ref) {
                var style = node.style,
                    computedStyle = _.computeStyle(node),
                    isHidden = typeof fn === "function" ? fn(node) : fn,
                    duration = Math.max(calcDuration(computedStyle), calcDuration(computedStyle, true)),
                    hasAnimation = !_.LEGACY_ANDROID && _.CSS3_ANIMATIONS && duration && node.offsetWidth;

                // requestAnimationFrame fixes several issues here:
                // 1) animation of new added elements (http://christianheilmann.com/2013/09/19/quicky-fading-in-a-newly-created-element-using-css/)
                // 2) firefox-specific animations sync quirks (because of getComputedStyle call)
                // 3) power consuption: animations do nothing if page is not active
                _.raf(function() {
                    var transitionProperty = getTransitionProperty(computedStyle),
                        transitionDelay = getTransitionDelay(computedStyle),
                        transitionDuration = getTransitionDuration(computedStyle),
                        completeVisibilityChange = function() {
                            if (style.visibility === "hidden") {
                                style[absentStrategy[0]] = absentStrategy[1];
                            } else {
                                style.pointerEvents = "";
                            }

                            if (callback) callback(el, index, ref);
                        };

                    if (hasAnimation) {
                        setTransitionProperty(style, transitionProperty + ", visibility");

                        if (isHidden) {
                            setTransitionDuration(style, transitionDuration + ", 0s");
                            setTransitionDelay(style, transitionDelay + ", " + duration + "ms");
                        } else {
                            setTransitionDelay(style, transitionDelay + ", 0s");
                            setTransitionDuration(style, transitionDuration + ", " + duration + "ms");
                        }

                        node.addEventListener(eventType, function completeAnimation(e) {
                            if (e.propertyName === "visibility") {
                                e.stopImmediatePropagation(); // this is an internal event

                                setTransitionProperty(style, transitionProperty);
                                setTransitionDelay(style, transitionDelay);
                                setTransitionDuration(style, transitionDuration);

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
                    if (!hasAnimation) completeVisibilityChange();
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
