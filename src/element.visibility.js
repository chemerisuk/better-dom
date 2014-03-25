import _ from "./utils";
import $Element from "./element";
import styleAccessor from "./styleaccessor";

/**
 * Changing of element visibility support
 * @module visibility
 */

var parseTimeValue = (value) => {
        var endIndex = value.length - 1;

        return value.lastIndexOf("ms") === endIndex - 1 || value.lastIndexOf("s") !== endIndex ?
            parseFloat(value) : parseFloat(value) * 1000;
    },
    calcDuration = (style, animation) => {
        var prefix = animation ? "animation-" : "transition-",
            delay = styleAccessor.get[prefix + "delay"](style).split(","),
            duration = styleAccessor.get[prefix + "duration"](style).split(","),
            iterationCount = animation ? styleAccessor.get[prefix + "iteration-count"](style).split(",") : [];

        return Math.max.apply(Math, duration.map((value, index) => {
            var it = iterationCount[index] || "1";
            // initial or empty value equals to 1
            return (it === "initial" ? 1 : parseFloat(it)) *
                parseTimeValue(value) + (parseTimeValue(delay[index]) || 0);
        }));
    },
    transitionProps = ["timing-function", "property", "duration", "delay"].map((p) => "transition-" + p),
    eventType = _.WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    absentStrategy = !_.LEGACY_ANDROID && _.CSS3_ANIMATIONS ? ["position", "absolute"] : ["display", "none"],
    changeVisibility = (el, fn, callback) => () => el.legacy((node, el, index, ref) => {
        var style = node.style,
            compStyle = _.computeStyle(node),
            isHidden = typeof fn === "function" ? fn(node) : fn,
            isDetached = !_.docEl.contains(node),
            completeVisibilityChange = () => {
                if (style.visibility === "hidden") {
                    style[absentStrategy[0]] = absentStrategy[1];
                } else {
                    style.pointerEvents = "";
                }

                if (callback) callback(el, index, ref);
            },
            processVisibilityChange = () => {
                var duration, index, transition, absentance;

                // Android Browser is too slow and has a lot of bugs in
                // the implementation, so disable animations for them
                if (!_.LEGACY_ANDROID && _.CSS3_ANIMATIONS && !isDetached) {
                    duration = Math.max(calcDuration(compStyle), calcDuration(compStyle, true));
                }

                if (duration) {
                    // make sure that the visibility property will be changed
                    // to trigger the completeAnimation callback
                    if (!style.visibility) style.visibility = isHidden ? "visible" : "hidden";

                    transition = transitionProps.map((prop, index) => {
                        // have to use regexp to split transition-timing-function value
                        return styleAccessor.get[prop](compStyle).split(index ? ", " : /, (?!\d)/);
                    });

                    // try to find existing or use 0s length or make a new visibility transition
                    index = transition[1].indexOf("visibility");
                    if (index < 0) index = transition[2].indexOf("0s");
                    if (index < 0) index = transition[0].length;

                    transition[0][index] = "linear";
                    transition[1][index] = "visibility";
                    transition[isHidden ? 2 : 3][index] = "0s";
                    transition[isHidden ? 3 : 2][index] = duration + "ms";

                    transition.forEach((value, index) => {
                        styleAccessor.set[transitionProps[index]](style, value.join(", "));
                    });

                    node.addEventListener(eventType, function completeAnimation(e) {
                        if (e.propertyName === "visibility") {
                            e.stopPropagation(); // this is an internal event

                            node.removeEventListener(eventType, completeAnimation, false);

                            completeVisibilityChange();
                        }
                    }, false);
                }

                if (isHidden) {
                    absentance = style[absentStrategy[0]];
                    // store current inline value in a internal property
                    if (absentance !== "none") el.set("__visibility", absentance);
                    // prevent accidental user actions during animation
                    style.pointerEvents = "none";
                } else {
                    // restore initial property value if it exists
                    style[absentStrategy[0]] = el.get("__visibility") || "";
                }

                style.visibility = isHidden ? "hidden" : "visible";
                // trigger native CSS animation
                el.set("aria-hidden", String(isHidden));
                // must be AFTER changing the aria-hidden attribute
                if (!duration) completeVisibilityChange();
            };

        // if element is not detached use requestAnimationFrame that fixes several issues:
        // 1) animation of new added elements (http://christianheilmann.com/2013/09/19/quicky-fading-in-a-newly-created-element-using-css/)
        // 2) firefox-specific animations sync quirks (because of the getComputedStyle call)
        // 3) power consuption: show/hide do almost nothing if page is not active
        if (isDetached) {
            processVisibilityChange();
        } else {
            _.raf(processVisibilityChange);
        }
    }),
    makeVisibilityMethod = (name, fn) => function(delay, callback) {
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
