import { register, computeStyle } from "../util/index";
import { MethodError } from "../errors";
import { WINDOW, WEBKIT_PREFIX, RETURN_THIS } from "../const";
import AnimationHandler from "../util/animationhandler";

var TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
    ANIMATION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend";

register({
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
    show: false,

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
    hide: true,

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
    toggle: null

}, (methodName, condition) => function(animationName, callback) {
    if (typeof animationName === "boolean") {
        if (animationName === true) {
            return this.css("display", condition ? "none" : "");
        } else if (condition == null) {
            return this.css("display", "none");
        } else {
            return this;
        }
    } else if (typeof animationName !== "string") {
        callback = animationName;
        animationName = null;
    }

    if (callback && typeof callback !== "function") {
        throw new MethodError(methodName, arguments);
    }

    var node = this[0],
        style = node.style,
        computed = computeStyle(node),
        hiding = condition,
        animationHandler, eventType,
        done = () => {
            if (animationHandler) {
                node.removeEventListener(eventType, animationHandler, true);
                // clear inline style adjustments were made previously
                style.cssText = animationHandler.initialCssText;
            }
            // always update element visibility property: use value "inherit"
            // to respect parent container visibility. Should be a separate
            // from setting cssText because of Opera 12 quirks
            style.visibility = hiding ? "hidden" : "inherit";

            if (callback) {
                if (animationHandler) {
                    callback(this);
                } else {
                    // done callback is always async
                    WINDOW.setTimeout(() => { callback(this) }, 0);
                }
            }
        };

    if (typeof hiding !== "boolean") {
        hiding = computed.visibility !== "hidden";
    }

    animationHandler = AnimationHandler(node, computed, animationName, hiding, done);
    eventType = animationName ? ANIMATION_EVENT_TYPE : TRANSITION_EVENT_TYPE;

    if (animationHandler) {
        node.addEventListener(eventType, animationHandler, true);
        // trigger animation(s)
        style.cssText = animationHandler.initialCssText + animationHandler.cssText;
    } else {
        done();
    }
    // trigger CSS3 transition if it exists
    return this.set("aria-hidden", String(hiding));
}, () => RETURN_THIS);
