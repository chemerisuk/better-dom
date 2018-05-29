import { $Element } from "../element/index";
import { keys, isArray, computeStyle } from "../util/index";
import { MethodError } from "../errors";
import HOOK from "../util/stylehooks";

/**
 * CSS properties accessor for an element
 * @param  {String|Object} name Style property name or key/value object
 * @param  {String|Function} [value] Style property value or functor
 * @return {String|$Element} Property value or self
 * @example
 * link.css("color");                 // => element color property
 * link.css("box-sizing");            // => value of "box-sizing" (no vendor prefix needed)
 * link.css("color", "red");          // update element color
 * link.css("animation-delay", "1s"); // update animation-delay (no vendor prefix needed)
 */
$Element.prototype.css = function(name, value) {
    const len = arguments.length;
    const node = this[0];

    if (!node) {
        if (len === 1 && isArray(name)) {
            return {};
        }

        if (len !== 1 || typeof name !== "string") {
            return this;
        }

        return;
    }

    const style = node.style;
    var computed;

    if (len === 1 && (typeof name === "string" || isArray(name))) {
        let strategy = (name) => {
            var getter = HOOK.get[name] || HOOK.find(name, style),
                value = typeof getter === "function" ? getter(style) : style[getter];

            if (!value) {
                if (!computed) computed = computeStyle(node);

                value = typeof getter === "function" ? getter(computed) : computed[getter];
            }

            return value;
        };

        if (typeof name === "string") {
            return strategy(name);
        } else {
            return name.map(strategy).reduce((memo, value, index) => {
                memo[name[index]] = value;

                return memo;
            }, {});
        }
    }

    if (len === 2 && typeof name === "string") {
        var setter = HOOK.set[name] || HOOK.find(name, style);

        if (typeof value === "function") {
            value = value(this);
        }

        if (value == null) value = "";

        if (typeof setter === "function") {
            setter(value, style);
        } else {
            style[setter] = typeof value === "number" ? value + "px" : value.toString();
        }
    } else if (len === 1 && name && typeof name === "object") {
        keys(name).forEach((key) => { this.css(key, name[key]) });
    } else {
        throw new MethodError("css", arguments);
    }

    return this;
};
