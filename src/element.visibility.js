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
    readAnimationProp = function(key, style) {
        var fn = styleAccessor.get[key];

        return fn && parseFloat(fn(style)) || 0;
    },
    prop = function(name) {
        return _.WEBKIT_PREFIX ? "webkitT" + name.substr(1) : name;
    },
    changeVisibility = function(el, fn, callback) {
        return function() {
            el.legacy(function(node, el, index, ref) {
                var style = node.style,
                    computedStyle = _.computeStyle(node),
                    isHidden = !(typeof fn === "function" ? fn(node) : fn),
                    transitionDuration = readAnimationProp("transition-duration", computedStyle),
                    animationDuration = readAnimationProp("animation-duration", computedStyle),
                    iterationCount = readAnimationProp("animation-iteration-count", computedStyle),
                    duration = Math.max(iterationCount * animationDuration, transitionDuration),
                    hasAnimation = !_.LEGACY_ANDROID && _.CSS3_ANIMATIONS && duration && node.offsetWidth;

                _.raf(function() {
                    var transitionProperty = computedStyle[prop("transitionProperty")],
                        transitionDelay = computedStyle[prop("transitionDelay")],
                        transitionDuration = computedStyle[prop("transitionDuration")],
                        completeVisibilityChange = function() {
                            if (style.visibility === "hidden") {
                                style[absentStrategy[0]] = absentStrategy[1];
                            } else {
                                style.pointerEvents = "";
                            }

                            if (callback) callback(el, index, ref);
                        };

                    if (hasAnimation) {
                        style[prop("transitionProperty")] = transitionProperty + ", visibility";
                        style[prop(isHidden ? "transitionDelay" : "transitionDuration")] =
                            (isHidden ? transitionDelay : transitionDuration) + ", 0s";
                        style[prop(isHidden ? "transitionDuration" : "transitionDelay")] =
                            (isHidden ? transitionDuration : transitionDelay) + ", " + duration + "ms";

                        node.addEventListener(eventType, function completeAnimation(e) {
                            if (e.propertyName === "visibility") {
                                e.stopImmediatePropagation(); // this is an internal event

                                style[prop("transitionProperty")] = transitionProperty;
                                style[prop("transitionDelay")] = transitionDelay;
                                style[prop("transitionDuration")] = transitionDuration;

                                node.removeEventListener(eventType, completeAnimation, false);

                                completeVisibilityChange();
                            }
                        }, false);
                    }

                    if (isHidden) {
                        // restore initial property value if it exists
                        style[absentStrategy[0]] = el._visibility || "";
                    } else {
                        // store current inline value in a private property
                        el._visibility = style[absentStrategy[0]];
                        // do not store display:none
                        if (el._visibility === "none") el._visibility = "";
                        // prevent accidental user actions during animation
                        style.pointerEvents = "none";
                    }

                    style.visibility = isHidden ? "visible" : "hidden";
                    // trigger native CSS animation
                    el.set("aria-hidden", String(!isHidden));
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
