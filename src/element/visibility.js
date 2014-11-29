import _ from "../util/index";
import { MethodError } from "../errors";
import { WEBKIT_PREFIX, FRAME_DATA } from "../const";
import AnimationHandler from "../util/animationhandler";

var TRANSITION_EVENT_TYPE = WEBKIT_PREFIX ? "webkitTransitionEnd" : "transitionend",
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
            frameId = this._[FRAME_DATA],
            done = () => {
                if (animationHandler) {
                    node.removeEventListener(eventType, animationHandler, true);
                    // clear inline style adjustments were made previously
                    style.cssText = animationHandler.initialCssText;
                } else {
                    this.set("aria-hidden", String(hiding));
                }
                // always update element visibility property: use value "inherit"
                // to respect parent container visibility. Should be a separate
                // from setting cssText because of Opera 12 quirks
                style.visibility = hiding ? "hidden" : "inherit";

                this._[FRAME_DATA] = null;

                if (callback) callback.call(this);
            };

        if (typeof hiding !== "boolean") {
            hiding = computed.visibility !== "hidden";
        }

        // cancel previous frame if it exists
        if (frameId) DOM.cancelFrame(frameId);

        if (!node.ownerDocument.documentElement.contains(node)) {
            // apply attribute/visibility syncronously for detached DOM elements
            // because browser returns zero animation/transition duration for them
            done();
        } else {
            var animationHandler = AnimationHandler(node, computed, animationName, hiding, done),
                eventType = animationName ? ANIMATION_EVENT_TYPE : TRANSITION_EVENT_TYPE;
            // use requestAnimationFrame to avoid animation quirks for
            // new elements inserted into the DOM
            // http://christianheilmann.com/2013/09/19/quicky-fading-in-a-newly-created-element-using-css/
            this._[FRAME_DATA] = DOM.nextFrame(!animationHandler ? done : () => {
                node.addEventListener(eventType, animationHandler, true);
                // update modified style rules
                style.cssText = animationHandler.initialCssText + animationHandler.cssText;
                // trigger CSS3 transition / animation
                this.set("aria-hidden", String(hiding));
            });
        }

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
