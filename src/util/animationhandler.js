import CSS from "./stylehooks";
import { WEBKIT_PREFIX, HTML, DOCUMENT } from "../const";

// https://twitter.com/jaffathecake/status/570872103227953153
var LEGACY_BROWSER = !("visibilityState" in DOCUMENT || "webkitVisibilityState" in DOCUMENT),
    TRANSITION_PROPS = ["timing-function", "property", "duration", "delay"].map((prop) => "transition-" + prop),
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
    };

// initialize hooks for properties used below
TRANSITION_PROPS.concat("animation-duration").forEach((prop) => { CSS.find(prop, HTML.style) });

export default (node, computed, animationName, hiding, done) => {
    var rules, duration;

    // browser returns zero animation/transition duration for detached elements
    if (!node.ownerDocument.documentElement.contains(node)) return null;

    // Legacy Android is usually slow and has lots of bugs in the
    // CSS animations implementation, so skip any animations for it

    // Determine of we need animation by checking if an element
    // has non-zero width. It also fixes animation of new elements
    // inserted into the DOM in Webkit and Opera 12 browsers
    /* istanbul ignore next */
    if (LEGACY_BROWSER || !computed.width) return null;

    if (animationName) {
        duration = parseTimeValue(computed[CSS.get["animation-duration"]]);

        if (!duration) return; // skip animations with zero duration

        rules = [
            WEBKIT_PREFIX + "animation-direction:" + (hiding ? "normal" : "reverse"),
            WEBKIT_PREFIX + "animation-name:" + animationName,
            // for CSS3 animation element should always be visible
            "visibility:inherit"
        ];
    } else {
        var transitionValues = TRANSITION_PROPS.map((prop, index) => {
                // have to use regexp to split transition-timing-function value
                return computed[CSS.get[prop]].split(index ? ", " : /, (?!\d)/);
            });

        duration = calcTransitionDuration(transitionValues);

        if (!duration) return; // skip transitions with zero duration

        if (transitionValues[1].indexOf("all") < 0) {
            // try to find existing or use 0s length or make a new visibility transition
            var visibilityIndex = transitionValues[1].indexOf("visibility");

            if (visibilityIndex < 0) visibilityIndex = transitionValues[2].indexOf("0s");
            if (visibilityIndex < 0) visibilityIndex = transitionValues[1].length;

            transitionValues[0][visibilityIndex] = "linear";
            transitionValues[1][visibilityIndex] = "visibility";
            transitionValues[hiding ? 2 : 3][visibilityIndex] = "0s";
            transitionValues[hiding ? 3 : 2][visibilityIndex] = duration + "ms";
        }

        rules = transitionValues.map((props, index) => {
            // fill holes in a trasition property value
            for (var i = 0, n = props.length; i < n; ++i) {
                props[i] = props[i] || props[i - 1] || "initial";
            }

            return WEBKIT_PREFIX + TRANSITION_PROPS[index] + ":" + props.join(", ");
        });

        rules.push(
            // append target visibility value to trigger transition
            "visibility:" + (hiding ? "hidden" : "inherit"),
            // use willChange to improve performance in modern browsers:
            // http://dev.opera.com/articles/css-will-change-property/
            "will-change:" + transitionValues[1].join(", ")
        );
    }

    return {
        cssText: rules.join(";"),
        initialCssText: node.style.cssText,
        // this function used to trigger callback
        handleEvent: (e) => {
            if (e.target === node) {
                if (animationName) {
                    if (e.animationName !== animationName) return;
                } else {
                    if (e.propertyName !== "visibility") return;
                }

                e.stopPropagation(); // this is an internal event

                done();
            }
        }
    };
};
