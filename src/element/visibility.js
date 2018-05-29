import { MethodError } from "../errors";
import { $Element } from "../element/index";
import { computeStyle, raf } from "../util/index";
import AnimationHandler from "../util/animationhandler";

function makeMethod(methodName, condition) {
    return function(animationName, callback) {
        if (typeof animationName !== "string") {
            callback = animationName;
            animationName = null;
        }

        if (callback && typeof callback !== "function") {
            throw new MethodError(methodName, arguments);
        }

        const node = this[0];

        if (!node) return this;

        const computed = computeStyle(node);
        // Determine of we need animation by checking if an element
        // has non-zero width. Triggers reflow but fixes animation
        // for new elements inserted into the DOM in some browsers

        if (node && computed.width) {
            const complete = () => {
                node.style.visibility = condition ? "hidden" : "inherit";

                if (typeof callback === "function") {
                    callback(this);
                }
            };

            if (!node.ownerDocument.documentElement.contains(node)) {
                raf(complete); // skip animating of detached elements
            } else if (!animationName && parseFloat(computed["transition-duration"]) === 0) {
                raf(complete); // skip animating with zero transition duration
            } else if (animationName && parseFloat(computed["animation-duration"]) === 0) {
                raf(complete); // skip animating with zero animation duration
            } else {
                // always make an element visible before animation start
                node.style.visibility = "visible";

                new AnimationHandler(node, animationName)
                    .start(complete, condition ? "normal" : "reverse");
            }
        }
        // trigger CSS3 transition if it exists
        return this.set("aria-hidden", String(condition));
    };
}

/**
 * Show an element using CSS3 transition or animation
 * @param {String} [animationName] CSS animation name to apply during transition
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element} Self
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
$Element.prototype.show = makeMethod("show", false);

/**
 * Hide an element using CSS3 transition or animation
 * @param {String} [animationName] CSS animation name to apply during transition
 * @param {Function} [callback] function that executes when animation is done
 * @return {$Element} Self
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
$Element.prototype.hide = makeMethod("hide", true);
