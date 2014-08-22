import _ from "../helpers";
import { MethodError } from "../errors";
import { CSS3_ANIMATIONS, WEBKIT_PREFIX, LEGACY_ANDROID } from "../constants";
import { $Element, DOM } from "../types";
import CSS from "../util/stylehooks";

var ANIMATIONS_ENABLED = !LEGACY_ANDROID && CSS3_ANIMATIONS,
    TRANSITION_PROPS = ["timing-function", "property", "duration", "delay"].map((p) => "transition-" + p),
    TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    ABSENT_STRATEGY = ANIMATIONS_ENABLED ? ["position", "absolute"] : ["display", "none"],
    parseTimeValue = (value) => {
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
    calcAnimationDuration = (node, style, isHidden, complete) => {
        var compStyle = _.computeStyle(node),
            duration = Math.max(calcDuration(compStyle, "transition-", []), calcDuration(compStyle, "animation-"));

        if (duration) {
            let visibilityTransitionIndex, transitionValues, completeAnimation, timeoutId;

            transitionValues = TRANSITION_PROPS.map((prop, index) => {
                // have to use regexp to split transition-timing-function value
                return CSS.get[prop](compStyle).split(index ? ", " : /, (?!\d)/);
            });

            // try to find existing or use 0s length or make a new visibility transition
            visibilityTransitionIndex = transitionValues[1].indexOf("visibility");
            if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[2].indexOf("0s");
            if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[0].length;

            transitionValues[0][visibilityTransitionIndex] = "linear";
            transitionValues[1][visibilityTransitionIndex] = "visibility";
            transitionValues[isHidden ? 2 : 3][visibilityTransitionIndex] = "0s";
            transitionValues[isHidden ? 3 : 2][visibilityTransitionIndex] = duration + "ms";

            transitionValues.forEach((value, index) => {
                CSS.set[TRANSITION_PROPS[index]](style, value.join(", "));
            });

            // make sure that the visibility property will be changed
            // to trigger the completeAnimation callback
            style.visibility = isHidden ? "visible" : "hidden";
            // use willChange to improve performance in modern browsers:
            // http://dev.opera.com/articles/css-will-change-property/
            style.willChange = transitionValues[1].join(", ");

            completeAnimation = (e) => {
                if (!e || e.propertyName === "visibility") {
                    if (e) e.stopPropagation(); // this is an internal transition

                    clearTimeout(timeoutId);

                    node.removeEventListener(TRANSITION_EVENT_TYPE, completeAnimation, false);

                    complete();
                }
            };

            node.addEventListener(TRANSITION_EVENT_TYPE, completeAnimation, false);
            // make sure that the completeAnimation callback will be called
            timeoutId = setTimeout(completeAnimation, duration + 1000 / 60);
        }

        return duration;
    },
    changeVisibility = (el, fn, callback) => () => {
        var node = el[0],
            style = node.style,
            isHidden = typeof fn === "function" ? fn(node) : fn,
            complete = () => {
                if (style.visibility === "hidden") {
                    style[ABSENT_STRATEGY[0]] = ABSENT_STRATEGY[1];
                }
                // remove temporary properties
                if (ANIMATIONS_ENABLED) style.willChange = "";

                if (callback) callback(el, node);
            },
            processVisibilityChange = () => {
                // Legacy Android is too slow and has a lot of bugs in the CSS animations
                // implementation, so skip animations for it (duration value is always zero)
                var duration = ANIMATIONS_ENABLED ? calcAnimationDuration(node, style, isHidden, complete) : 0;

                if (isHidden) {
                    let absentance = style[ABSENT_STRATEGY[0]];
                    // store current inline value in the internal property
                    if (absentance !== "none") el._._visibility = absentance;
                } else {
                    // restore initial property value if it exists
                    style[ABSENT_STRATEGY[0]] = el._._visibility || "";
                }

                style.visibility = isHidden ? "hidden" : "visible";
                // trigger native CSS animation
                el.set("aria-hidden", String(isHidden));
                // must be AFTER changing the aria-hidden attribute
                if (!duration) complete();
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
    },
    makeVisibilityMethod = (name, fn) => function(delay, callback) {
        var len = arguments.length,
            delayType = typeof delay;

        if (len === 1 && delayType === "function") {
            callback = delay;
            delay = 0;
        }

        if (delay && (delayType !== "number" || delay < 0) ||
            callback && typeof callback !== "function") {
            throw new MethodError(name);
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
 * @memberof! $Element#
 * @alias $Element#show
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.show = makeVisibilityMethod("show", false);

/**
 * Hide element with optional callback and delay
 * @memberof! $Element#
 * @alias $Element#hide
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.hide = makeVisibilityMethod("hide", true);

/**
 * Toggle element visibility with optional callback and delay
 * @memberof! $Element#
 * @alias $Element#toggle
 * @param {Number}   [delay=0]  time in miliseconds to wait
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.toggle = makeVisibilityMethod("toggle", function(node) {
    return node.getAttribute("aria-hidden") !== "true";
});
