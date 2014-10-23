import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, WEBKIT_PREFIX, LEGACY_ANDROID } from "../const";
import CSS from "../util/stylehooks";
import HOOK from "../util/selectorhooks";

// Legacy Android is too slow and has a lot of bugs in the CSS animations
// implementation, so skip any animations for it
var ANIMATIONS_ENABLED = !(LEGACY_ANDROID || JSCRIPT_VERSION < 10),
    TRANSITION_PROPS = ["timing-function", "property", "duration", "delay"].map((p) => "transition-" + p),
    TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    ANIMATION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend",
    parseTimeValue = (value) => {
        var result = parseFloat(value) || 0;
        // if duration is in seconds, then multiple result value by 1000
        return !result || value.slice(-2) === "ms" ? result : result * 1000;
    },
    calcTransitionDuration = (transitionValues) => {
        var delays = transitionValues[3],
            durations = transitionValues[2];

        return Math.max.apply(Math, durations.map((value, index) => {
            return parseTimeValue(value) + (parseTimeValue(delays[index]) || 0);
        }));
    },
    scheduleTransition = (node, style, computed, hiding, done) => {
        var transitionValues = TRANSITION_PROPS.map((prop, index) => {
                // have to use regexp to split transition-timing-function value
                return CSS.get[prop](computed).split(index ? ", " : /, (?!\d)/);
            }),
            duration = calcTransitionDuration(transitionValues);

        if (!duration) return false; // skip transitions with zero duration

        var visibilityTransitionIndex, cssText = style.cssText;

        // try to find existing or use 0s length or make a new visibility transition
        visibilityTransitionIndex = transitionValues[1].indexOf("visibility");
        if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[2].indexOf("0s");
        if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[1].length;

        transitionValues[0][visibilityTransitionIndex] = "linear";
        transitionValues[1][visibilityTransitionIndex] = "visibility";
        transitionValues[hiding ? 2 : 3][visibilityTransitionIndex] = "0s";
        transitionValues[hiding ? 3 : 2][visibilityTransitionIndex] = duration + "ms";

        // use willChange to improve performance in modern browsers:
        // http://dev.opera.com/articles/css-will-change-property/
        var appendString = "; will-change: " + transitionValues[1].join(", ");

        transitionValues.forEach((prop, index) => {
            appendString += "; " + WEBKIT_PREFIX + TRANSITION_PROPS[index] + ": " + prop.join(", ");
        });
        // append target visibility value to trigger transition
        cssText += "; visibility: " + (hiding ? "hidden" : "inherit");

        node.addEventListener(TRANSITION_EVENT_TYPE, function completeTransition(e) {
            if (e.propertyName === "visibility") {
                e.stopPropagation(); // this is an internal transition

                node.removeEventListener(TRANSITION_EVENT_TYPE, completeTransition, true);

                style.cssText = cssText; // remove temporary properties

                done();
            }
        }, true);

        // now set updated transition
        style.cssText = cssText + appendString;

        return true;
    },
    scheduleAnimation = (node, style, computed, animationName, hiding, done) => {
        var duration = parseTimeValue(CSS.get["animation-duration"](computed));

        if (!duration) return false; // skip animations with zero duration

        node.addEventListener(ANIMATION_EVENT_TYPE, function completeAnimation(e) {
            if (e.animationName === animationName) {
                e.stopPropagation(); // this is an internal animation

                node.removeEventListener(ANIMATION_EVENT_TYPE, completeAnimation, true);

                CSS.set["animation-name"](style, ""); // remove temporary animation
                CSS.set["animation-direction"](style, "");

                if (hiding) style.visibility = "hidden";

                done();
            }
        }, true);

        // trigger animation start
        CSS.set["animation-direction"](style, hiding ? "normal" : "reverse");
        CSS.set["animation-name"](style, animationName);

        if (!hiding) style.visibility = "inherit";

        return true;
    },
    makeMethod = (name, condition) => function(animationName, callback) {
        if (typeof animationName !== "string") {
            callback = animationName;
            animationName = null;
        }

        if (callback && typeof callback !== "function") {
            throw new MethodError(name, arguments);
        }

        var node = this[0],
            style = node.style,
            computed = _.computeStyle(node),
            hiding = condition,
            done = () => {
                // Check equality of the flag and aria-hidden to recognize
                // cases when an animation was toggled in the intermediate
                // state. Don't need to proceed in such situation
                if (String(hiding) === node.getAttribute("aria-hidden")) {
                    if (!animatable) {
                        // always update element visibility property
                        // for CSS3 animation element should always be visible
                        // use value "inherit" to respect parent container visibility
                        style.visibility = hiding && !animationName ? "hidden" : "inherit";
                        // no animation was applied
                        if (hiding) {
                            let displayValue = computed.display;

                            if (displayValue !== "none") {
                                // internally store original display value
                                this._._display = displayValue;
                            }

                            style.display = "none";
                        } else {
                            // restore previously store display value
                            style.display = this._._display || "inherit";
                        }
                    }

                    if (callback) callback.call(this);
                }
            },
            // Determine of we need animation by checking if an
            // element has non-zero offsetWidth. It also fixes
            // animation of an element inserted into the DOM in Webkit
            // browsers pluse Opera 12 issue with CSS3 animations
            animatable = ANIMATIONS_ENABLED && node.offsetWidth;

        if (typeof hiding !== "boolean") {
            hiding = !HOOK[":hidden"](node);
        }

        if (animatable) {
            if (animationName) {
                animatable = scheduleAnimation(node, style, computed, animationName, hiding, done);
            } else {
                animatable = scheduleTransition(node, style, computed, hiding, done);
            }
        }
        // trigger CSS3 transition if it exists
        this.set("aria-hidden", String(hiding));
        // must be AFTER changing the aria-hidden attribute
        if (!animatable) done();

        return this;
    };

_.register({
    /**
     * Show an element using CSS3 transition or animation
     * @memberof! $Element#
     * @alias $Element#show
     * @param {String}   [animationName]  CSS animation to apply during transition
     * @param {Function} [callback]       function that executes when animation is done
     * @return {$Element}
     * @function
     * @example
     * link.show(); // displays element
     *
     * foo.show(function() {
     *   // do something when transition is completed
     * });
     *
     * bar.show("fade", function() {
     *   // do something when "fade" animation is completed
     * });
     */
    show: makeMethod("show", false),

    /**
     * Hide an element using CSS3 transition or animation
     * @memberof! $Element#
     * @alias $Element#hide
     * @param {String}   [animationName]  CSS animation to apply during transition
     * @param {Function} [callback]       function that executes when animation is done
     * @return {$Element}
     * @function
     * @example
     * link.hide(); // hides element
     *
     * foo.hide(function() {
     *   // do something when transition is completed
     * });
     *
     * bar.hide("fade", function() {
     *   // do something when "fade" animation is completed
     * });
     */
    hide: makeMethod("hide", true),

    /**
     * Toggle an element using CSS3 transition or animation
     * @memberof! $Element#
     * @alias $Element#toggle
     * @param {String}   [animationName]  CSS animation to apply during transition
     * @param {Function} [callback]       function that executes when animation is done
     * @return {$Element}
     * @function
     * @example
     * link.toggle(); // toggles element visibility
     *
     * foo.toggle(function() {
     *   // do something when transition is completed
     * });
     *
     * bar.toggle("fade", function() {
     *   // do something when "fade" animation is completed
     * });
     */
    toggle: makeMethod("toggle")
});
