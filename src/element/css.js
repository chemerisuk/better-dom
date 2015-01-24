import { register, keys, isArray, computeStyle } from "../util/index";
import { MethodError } from "../errors";
import HOOK from "../util/stylehooks";

register({
    /**
     * CSS properties accessor for an element
     * @memberof! $Element#
     * @alias $Element#css
     * @param  {String|Object}      name    style property name or key/value object
     * @param  {String|Function}    [value] style property value or functor
     * @return {String|$Element} a property value or reference to <code>this</code>
     * @example
     * link.css("color");                 // => element color property
     * link.css("box-sizing");            // => value of "box-sizing" (no vendor prefix needed)
     * link.css("color", "red");          // update element color
     * link.css("animation-delay", "1s"); // update animation-delay (no vendor prefix needed)
     */
    css(name, value) {
        var len = arguments.length,
            node = this[0],
            style = node.style,
            computed;

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
    }
}, null, () => function(name) {
    if (arguments.length === 1 && isArray(name)) {
        return {};
    }

    if (arguments.length !== 1 || typeof name !== "string") {
        return this;
    }
});
