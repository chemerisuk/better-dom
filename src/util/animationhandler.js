import { WEBKIT_PREFIX } from "../const";
import CSS from "./stylehooks";

var TRANSITION_PROPS = ["property", "duration", "timing-function", "delay"].map((p) => "transition-" + p),
    parseTimeValue = (value) => {
        var result = parseFloat(value) || 0;
        // if duration is in seconds, then multiple result value by 1000
        return !result || value.slice(-2) === "ms" ? result : result * 1000;
    },
    calcTransitionDuration = (transitionValues) => {
        var delays = transitionValues[3],
            durations = transitionValues[1];

        return Math.max.apply(Math, durations.map((value, index) => {
            return parseTimeValue(value) + (parseTimeValue(delays[index]) || 0);
        }));
    };

export default (computed, animationName, hiding, done) => {
    var rules, duration;

    if (animationName) {
        duration = parseTimeValue(CSS.get["animation-duration"](computed));

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
                return CSS.get[prop](computed).split(index === 2 ? /, (?!\d)/ : ", ");
            });

        duration = calcTransitionDuration(transitionValues);

        if (!duration) return; // skip transitions with zero duration

        if (transitionValues[0].indexOf("all") < 0) {
            // try to find existing or use 0s length or make a new visibility transition
            var visibilityIndex = transitionValues[0].indexOf("visibility");

            if (visibilityIndex < 0) visibilityIndex = transitionValues[1].indexOf("0s");
            if (visibilityIndex < 0) visibilityIndex = transitionValues[0].length;

            transitionValues[0][visibilityIndex] = "visibility";
            transitionValues[2][visibilityIndex] = "linear";
            transitionValues[hiding ? 1 : 3][visibilityIndex] = "0s";
            transitionValues[hiding ? 3 : 1][visibilityIndex] = duration + "ms";
        }

        rules = transitionValues.map((prop, index) => {
            return WEBKIT_PREFIX + TRANSITION_PROPS[index] + ":" + prop.join(", ");
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
        rules: rules,
        // this function used to trigger callback
        handleEvent: (e) => {
            if (animationName) {
                if (e.animationName !== animationName) return;
            } else {
                if (e.propertyName !== "visibility") return;
            }

            e.stopPropagation(); // this is an internal event

            done();
        }
    };
};
