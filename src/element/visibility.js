import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, WEBKIT_PREFIX, LEGACY_ANDROID } from "../const";
import CSS from "../util/stylehooks";

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
    calcTransitionDuration = (style) => {
        var delay = CSS.get["transition-delay"](style).split(","),
            duration = CSS.get["transition-duration"](style).split(",");

        return Math.max.apply(Math, duration.map((value, index) => {
            return parseTimeValue(value) + (parseTimeValue(delay[index]) || 0);
        }));
    },
    scheduleTransition = (node, style, computed, hiding, done) => {
        var duration = calcTransitionDuration(computed);

        if (!duration) return false; // skip transitions with zero duration

        var visibilityTransitionIndex, transitionValues;

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

        node.addEventListener(TRANSITION_EVENT_TYPE, function completeTransition(e) {
            if (e.propertyName === "visibility") {
                e.stopPropagation(); // this is an internal transition

                node.removeEventListener(TRANSITION_EVENT_TYPE, completeTransition, true);

                style.willChange = ""; // remove temporary properties

                done();
            }
        }, true);

        // make sure that the visibility property will be changed
        // so reset it to appropriate value with zero
        style.visibility = hiding ? "inherit" : "hidden";
        // use willChange to improve performance in modern browsers:
        // http://dev.opera.com/articles/css-will-change-property/
        style.willChange = transitionValues[1].join(", ");

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

                done();
            }
        }, true);

        // trigger animation start
        CSS.set["animation-direction"](style, hiding ? "normal" : "reverse");
        CSS.set["animation-name"](style, animationName);

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
            visibility = computed.visibility,
            displayValue = computed.display,
            hiding = condition,
            done = () => {
                // Check equality of the flag and aria-hidden to recognize
                // cases when an animation was toggled in the intermediate
                // state. Don't need to proceed in such situation
                if (String(hiding) === node.getAttribute("aria-hidden")) {
                    // remove element from the flow when animation is done
                    if (hiding && animationName) {
                        if (animatable) {
                            style.visibility = "hidden";
                        } else {
                            style.display = "none";
                        }
                    }

                    if (callback) callback.call(this);
                }
            },
            animatable;

        if (typeof hiding !== "boolean") {
            hiding = displayValue !== "none" && visibility !== "hidden" &&
                node.getAttribute("aria-hidden") !== "true";
        }

        if (ANIMATIONS_ENABLED) {
            // Use offsetWidth to trigger reflow of the element.
            // Fixes animation of an element inserted into the DOM
            //
            // Opera 12 has an issue with animations as well,
            // so need to trigger reflow manually for it
            //
            // Thanks for the idea from Jonathan Snook's plugin:
            // https://github.com/snookca/prepareTransition

            if (!hiding) visibility = node.offsetWidth;

            if (animationName) {
                animatable = scheduleAnimation(node, style, computed, animationName, hiding, done);
            } else {
                animatable = scheduleTransition(node, style, computed, hiding, done);
            }
        }

        // handle old browsers or cases when there no animation
        if (hiding) {
            if (displayValue !== "none" && !animatable) {
                this._._display = displayValue;
                // we'll hide element later in the done call
            }
        } else {
            if (displayValue === "none" && !animatable) {
                // restore display property value
                style.display = this._._display || "inherit";
            }
        }

        // update element visibility value
        // for CSS3 animation element should always be visible
        // use value "inherit" to respect parent container visibility
        style.visibility = hiding && !animationName ? "hidden" : "inherit";
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
