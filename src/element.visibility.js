import _ from "./util";
import { $Element } from "./index";
import CSS from "./util/css";

/**
 * Changing of element visibility support
 * @module visibility
 */

var parseTimeValue = (value) => {
        var result = parseFloat(value) || 0;
        // if duration is in seconds, then multiple result value by 1000
        return value.lastIndexOf("ms") === value.length - 2 ? result : result * 1000;
    },
    calcDuration = (style, prefix, iterationCount) => {
        var delay = CSS.get[prefix + "delay"](style).split(","),
            duration = CSS.get[prefix + "duration"](style).split(",");

        if (!iterationCount) iterationCount = CSS.get[prefix + "iteration-count"](style).split(",");

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
            completeVisibilityChange = () => {
                if (style.visibility === "hidden") {
                    style[absentStrategy[0]] = absentStrategy[1];
                }

                if (!_.LEGACY_ANDROID && _.CSS3_ANIMATIONS) {
                    // remove temporary properties
                    style.willChange = "";
                }

                if (callback) callback(el, index, ref);
            },
            processVisibilityChange = () => {
                var compStyle = _.computeStyle(node),
                    isHidden = typeof fn === "function" ? fn(node) : fn,
                    duration, index, transition, absentance, completeAnimation, timeoutId;
                // Legacy Android is too slow and has a lot of bugs in the CSS animations
                // implementation, so skip animations for it (duration value is always zero)
                if (!_.LEGACY_ANDROID && _.CSS3_ANIMATIONS) {
                    duration = Math.max(calcDuration(compStyle, "transition-", []), calcDuration(compStyle, "animation-"));
                }

                if (duration) {
                    // make sure that the visibility property will be changed
                    // to trigger the completeAnimation callback
                    if (!style.visibility) style.visibility = isHidden ? "visible" : "hidden";

                    transition = transitionProps.map((prop, index) => {
                        // have to use regexp to split transition-timing-function value
                        return CSS.get[prop](compStyle).split(index ? ", " : /, (?!\d)/);
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
                        CSS.set[transitionProps[index]](style, value.join(", "));
                    });

                    // use willChange to improve performance in modern browsers:
                    // http://dev.opera.com/articles/css-will-change-property/
                    style.willChange = transition[1].join(", ");

                    completeAnimation = (e) => {
                        if (!e || e.propertyName === "visibility") {
                            if (e) e.stopPropagation(); // this is an internal event

                            clearTimeout(timeoutId);

                            node.removeEventListener(eventType, completeAnimation, false);

                            completeVisibilityChange();
                        }
                    };

                    node.addEventListener(eventType, completeAnimation, false);
                    // make sure that the completeAnimation callback will be called
                    timeoutId = setTimeout(completeAnimation, duration + 1000 / 60);
                }

                if (isHidden) {
                    absentance = style[absentStrategy[0]];
                    // store current inline value in the internal property
                    if (absentance !== "none") el._._visibility = absentance;
                } else {
                    // restore initial property value if it exists
                    style[absentStrategy[0]] = el._._visibility || "";
                }

                style.visibility = isHidden ? "hidden" : "visible";
                // trigger native CSS animation
                el.set("aria-hidden", String(isHidden));
                // must be AFTER changing the aria-hidden attribute
                if (!duration) completeVisibilityChange();
            };

        // by using requestAnimationFrame we fix several issues:
        // 1) animation of new added elements (http://christianheilmann.com/2013/09/19/quicky-fading-in-a-newly-created-element-using-css/)
        // 2) firefox-specific animations sync quirks (because of the getComputedStyle call)
        // 3) power consuption: looped show/hide does almost nothing if page is not active

        // use DOM.raf only if element is in DOM to avoid quirks on hide().show() calls
        if (DOM.contains(el)) {
            DOM.raf(processVisibilityChange);
        } else {
            processVisibilityChange();
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
