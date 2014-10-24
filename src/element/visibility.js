import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, WEBKIT_PREFIX, LEGACY_ANDROID } from "../const";
import HOOK from "../util/selectorhooks";
import AnimationHandler from "../util/animationhandler";

// Legacy Android is too slow and has a lot of bugs in the CSS animations
// implementation, so skip any animations for it
var ANIMATIONS_ENABLED = !(LEGACY_ANDROID || JSCRIPT_VERSION < 10),
    TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    ANIMATION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend",
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
            eventType = animationName ? ANIMATION_EVENT_TYPE : TRANSITION_EVENT_TYPE,
            initialCssText, animationHandler,
            done = () => {
                // Check equality of the flag and aria-hidden to recognize
                // cases when an animation was toggled in the intermediate
                // state. Don't need to proceed in such situation
                if (String(hiding) === node.getAttribute("aria-hidden")) {
                    if (animationHandler) {
                        node.removeEventListener(eventType, animationHandler, true);
                        // restore initial state
                        style.cssText = initialCssText;
                    } else {
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
                    // always update element visibility property
                    // use value "inherit" to respect parent container visibility
                    style.visibility = hiding ? "hidden" : "inherit";

                    if (callback) callback.call(this);
                }
            };

        if (typeof hiding !== "boolean") {
            hiding = !HOOK[":hidden"](node);
        }

        // Determine of we need animation by checking if an
        // element has non-zero offsetWidth. It also fixes
        // animation of an element inserted into the DOM in Webkit
        // browsers plus Opera 12 issue with CSS3 animations
        if (ANIMATIONS_ENABLED && node.offsetWidth) {
            animationHandler = AnimationHandler(computed, animationName, hiding, done);
        }

        if (animationHandler) {
            node.addEventListener(eventType, animationHandler, true);
            // remember initial cssText to restore later
            initialCssText = style.cssText;
            // trigger animation(s)
            style.cssText = initialCssText + animationHandler.rules.join(";");
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
