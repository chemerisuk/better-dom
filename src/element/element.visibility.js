import _ from "../helpers";
import { MethodError } from "../errors";
import { CSS3_ANIMATIONS, WEBKIT_PREFIX, LEGACY_ANDROID } from "../constants";
import { $Element } from "../types";
import CSS from "../util/stylehooks";

var ANIMATIONS_ENABLED = !LEGACY_ANDROID && CSS3_ANIMATIONS,
    TRANSITION_PROPS = ["timing-function", "property", "duration", "delay"].map((p) => "transition-" + p),
    TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    parseTimeValue = (value) => {
        var result = parseFloat(value) || 0;
        // if duration is in seconds, then multiple result value by 1000
        return value.lastIndexOf("ms") === value.length - 2 ? result : result * 1000;
    },
    calcTransitionDuration = (style) => {
        var delay = CSS.get["transition-delay"](style).split(","),
            duration = CSS.get["transition-duration"](style).split(",");

        return Math.max.apply(Math, duration.map((value, index) => {
            return parseTimeValue(value) + (parseTimeValue(delay[index]) || 0);
        }));
    },
    scheduleTransition = (node, style, computed, hiding, done) => {
        var duration = calcTransitionDuration(computed);

        if (!duration) return false;

        var visibilityTransitionIndex, transitionValues, completeTransition;

        transitionValues = TRANSITION_PROPS.map((prop, index) => {
            // have to use regexp to split transition-timing-function value
            return CSS.get[prop](computed).split(index ? ", " : /, (?!\d)/);
        });

        // try to find existing or use 0s length or make a new visibility transition
        visibilityTransitionIndex = transitionValues[1].indexOf("visibility");
        if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[2].indexOf("0s");
        if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[0].length;

        transitionValues[0][visibilityTransitionIndex] = "linear";
        transitionValues[1][visibilityTransitionIndex] = "visibility";
        transitionValues[hiding ? 2 : 3][visibilityTransitionIndex] = "0s";
        transitionValues[hiding ? 3 : 2][visibilityTransitionIndex] = duration + "ms";

        // now set target duration and delay
        transitionValues.forEach((value, index) => {
            CSS.set[TRANSITION_PROPS[index]](style, value.join(", "));
        });

        // make sure that the visibility property will be changed
        // so reset it to appropriate value with zero
        style.visibility = hiding ? "visible" : "hidden";
        // use willChange to improve performance in modern browsers:
        // http://dev.opera.com/articles/css-will-change-property/
        style.willChange = transitionValues[1].join(", ");

        completeTransition = (e) => {
            if (e.propertyName === "visibility" && e.target === node) {
                e.stopPropagation(); // this is an internal transition

                node.removeEventListener(TRANSITION_EVENT_TYPE, completeTransition, false);

                style.willChange = ""; // remove temporary properties

                done();
            }
        };

        node.addEventListener(TRANSITION_EVENT_TYPE, completeTransition, false);

        return true;
    },
    makeVisibilityMethod = (name, condition) => function(callback) {
        var node = this[0];

        if (callback && typeof callback !== "function") {
            throw new MethodError(name);
        }

        if (!node) return this;

        var style = node.style,
            computed = _.computeStyle(node),
            displayValue = computed.display,
            hiding = typeof condition === "boolean" ? condition : displayValue !== "none",
            done = () => {
                if (style.visibility === "hidden") {
                    style.display = "none";
                }

                if (callback) callback.call(this);
            },
            hasTransition;

        if (hiding) {
            if (displayValue !== "none") {
                this._._display = displayValue;
                // we'll hide element later in the complete call
            }
        } else {
            if (displayValue === "none") {
                // restore visibility
                style.display = this._._display || "inherit";
            }
        }

        // Legacy Android is too slow and has a lot of bugs in the CSS animations
        // implementation, so skip animations for it (duration value is always zero)
        if (ANIMATIONS_ENABLED) {
            hasTransition = scheduleTransition(node, style, computed, hiding, done);

            if (hasTransition && !hiding) {
                // Use offsetWidth to trigger reflow of the element
                // after changing from display:none
                //
                // Credits to Jonathan Snook's prepareTransition plugin:
                // https://github.com/snookca/prepareTransition
                //
                // We shouldn't change truthy of hasTransition, so use ~
                hasTransition = ~node.offsetWidth;
            }
        }

        // trigger visibility transition when it exists
        style.visibility = hiding ? "hidden" : "visible";
        // trigger native CSS animation
        this.set("aria-hidden", String(hiding));
        // must be AFTER changing the aria-hidden attribute
        if (!hasTransition) done();

        return this;
    };

/**
 * Show element with optional callback and delay
 * @memberof! $Element#
 * @alias $Element#show
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.show = makeVisibilityMethod("show", false);

/**
 * Hide element with optional callback and delay
 * @memberof! $Element#
 * @alias $Element#hide
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.hide = makeVisibilityMethod("hide", true);

/**
 * Toggle element visibility with optional callback and delay
 * @memberof! $Element#
 * @alias $Element#toggle
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element}
 * @function
 */
$Element.prototype.toggle = makeVisibilityMethod("toggle");
