import _ from "../util/index";
import { MethodError } from "../errors";
import { $Element } from "../types";
import HOOK from "../util/stylehooks";

/**
 * Callback function for changing a property/attribute
 * @callback cssCallback
 * @param  {String} currentValue current value of style property
 * @return {String|Number} a new value for style property
 */

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
$Element.prototype.css = function(name, value) {
    var len = arguments.length,
        node = this[0],
        nameType = typeof name,
        style, hook, computed, appendCssText;

    if (len === 1 && (nameType === "string" || _.isArray(name))) {
        if (node) {
            style = node.style;

            value = (nameType === "string" ? [name] : name).reduce((memo, name) => {
                hook = HOOK.get[name];
                value = hook ? hook(style) : style[name];

                if (!computed && !value) {
                    style = _.computeStyle(node);
                    value = hook ? hook(style) : style[name];

                    computed = true;
                }

                memo[name] = value;

                return memo;
            }, {});
        }

        return node && nameType === "string" ? value[name] : value;
    }

    if (node) {
        style = node.style;
        appendCssText = (key, value) => {
            var hook = HOOK.set[key];

            if (typeof value === "function") {
                value = value.call(this, this.css(key));
            }

            if (value == null) value = "";

            if (hook) {
                hook(style, value);
            } else {
                style[key] = typeof value === "number" ? value + "px" : value.toString();
            }
        };

        if (len === 1 && name && nameType === "object") {
            _.keys(name).forEach((key) => { appendCssText(key, name[key]) });
        } else if (len === 2 && nameType === "string") {
            appendCssText(name, value);
        } else {
            throw new MethodError("css");
        }
    }

    return this;
};
