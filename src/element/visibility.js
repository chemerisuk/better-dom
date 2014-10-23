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
    scheduleTransition = (node, computed, hiding, cssText, done) => {
        var transitionValues = TRANSITION_PROPS.map((prop, index) => {
                // have to use regexp to split transition-timing-function value
                return CSS.get[prop](computed).split(index ? ", " : /, (?!\d)/);
            }),
            duration = calcTransitionDuration(transitionValues);

        if (!duration) return; // skip transitions with zero duration

        var visibilityTransitionIndex;

        // try to find existing or use 0s length or make a new visibility transition
        visibilityTransitionIndex = transitionValues[1].indexOf("visibility");
        if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[2].indexOf("0s");
        if (visibilityTransitionIndex < 0) visibilityTransitionIndex = transitionValues[1].length;

        transitionValues[0][visibilityTransitionIndex] = "linear";
        transitionValues[1][visibilityTransitionIndex] = "visibility";
        transitionValues[hiding ? 2 : 3][visibilityTransitionIndex] = "0s";
        transitionValues[hiding ? 3 : 2][visibilityTransitionIndex] = duration + "ms";

        var cssToSet = cssText;
        // use willChange to improve performance in modern browsers:
        // http://dev.opera.com/articles/css-will-change-property/
        cssToSet += "; will-change: " + transitionValues[1].join(", ");
        // append target visibility value to trigger transition
        cssToSet += "; visibility: " + (hiding ? "hidden" : "inherit");

        transitionValues.forEach((prop, index) => {
            cssToSet += "; " + WEBKIT_PREFIX + TRANSITION_PROPS[index] + ": " + prop.join(", ");
        });

        node.addEventListener(TRANSITION_EVENT_TYPE, function completeTransition(e) {
            if (e.propertyName === "visibility") {
                done(e, completeTransition);
            }
        }, true);

        return [cssToSet, cssText];
    },
    scheduleAnimation = (node, computed, animationName, hiding, cssText, done) => {
        var duration = parseTimeValue(CSS.get["animation-duration"](computed));

        if (!duration) return; // skip animations with zero duration

        var cssToSet = cssText;

        node.addEventListener(ANIMATION_EVENT_TYPE, function completeAnimation(e) {
            if (e.animationName === animationName) {
                done(e, completeAnimation);
            }
        }, true);

        cssToSet += "; " + WEBKIT_PREFIX + "animation-direction: ";
        cssToSet += hiding ? "normal" : "reverse";
        cssToSet += "; " + WEBKIT_PREFIX + "animation-name: " + animationName;
        cssToSet += "; visibility: inherit";

        return [cssToSet, cssText];
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
            done = (e, eventHandler) => {
                // Check equality of the flag and aria-hidden to recognize
                // cases when an animation was toggled in the intermediate
                // state. Don't need to proceed in such situation
                if (String(hiding) === node.getAttribute("aria-hidden")) {
                    if (cssText) {
                        e.stopPropagation(); // this is an internal event

                        node.removeEventListener(e.type, eventHandler, true);
                        // need to set correct visibility when animation is completed
                        cssText[1] += "; visibility: " + (hiding ? "hidden" : "inherit");

                        style.cssText = cssText[1]; // remove temporary properties
                    } else {
                        // always update element visibility property
                        // for CSS3 animation element should always be visible
                        // use value "inherit" to respect parent container visibility
                        style.visibility = hiding ? "hidden" : "inherit";
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
            cssText = ANIMATIONS_ENABLED && node.offsetWidth ? style.cssText : null;

        if (typeof hiding !== "boolean") {
            hiding = !HOOK[":hidden"](node);
        }

        if (cssText) {
            if (animationName) {
                cssText = scheduleAnimation(node, computed, animationName, hiding, cssText, done);
            } else {
                cssText = scheduleTransition(node, computed, hiding, cssText, done);
            }
        }

        if (cssText) {
            style.cssText = cssText[0];
        } else {
            // done callback is always async
            setTimeout(done, 0);
        }
        // trigger CSS3 transition if it exists
        return this.set("aria-hidden", String(hiding));
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
