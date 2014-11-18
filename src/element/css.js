import _ from "../util/index";
import { MethodError } from "../errors";
import HOOK from "../util/stylehooks";

_.register({
    /**
     * CSS properties accessor for an element
     * @memberof! $Element#
     * @alias $Element#css
     * @param  {String|Object}      name    style property name or key/value object
     * @param  {String|cssCallback} [value] style property value or {@link cssCallback}
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
            nameType = typeof name,
            computed;

        if (len === 1 && (nameType === "string" || _.isArray(name))) {
            value = (nameType === "string" ? [name] : name).reduce((memo, name) => {
                var getter = HOOK.get[name] || HOOK.find(name, style),
                    value = typeof getter === "function" ? getter(style) : style[getter];

                if (!computed && !value) {
                    style = _.computeStyle(node);
                    value = typeof getter === "function" ? getter(style) : style[getter];

                    computed = true;
                }

                memo[name] = value;

                return memo;
            }, {});

            return nameType === "string" ? value[name] : value;
        }

        if (len === 2 && typeof name === "string") {
            var setter = HOOK.set[name] || HOOK.find(name, style);

            if (typeof value === "function") {
                value = value.call(this, this.css(name));
            }

            if (value == null) value = "";

            if (typeof setter === "function") {
                setter(value, style);
            } else {
                style[setter] = typeof value === "number" ? value + "px" : value.toString();
            }
        } else if (len === 1 && name && nameType === "object") {
            _.keys(name).forEach((key) => { this.css(key, name[key]) });
        } else {
            throw new MethodError("css", arguments);
        }

        return this;
    }
}, () => function(name) {
    if (arguments.length === 1 && _.isArray(name)) {
        return {};
    }

    if (arguments.length !== 1 || typeof name !== "string") {
        return this;
    }
});

/**
 * Callback function for changing a property/attribute
 * @callback cssCallback
 * @param  {String} currentValue current value of style property
 * @return {String|Number} a new value for style property
 */
