import { register, keys, isArray } from "../util/index";
import { MethodError } from "../errors";

var reUpper = /[A-Z]/g,
    readPrivateProperty = (node, key) => {
        // convert from camel case to dash-separated value
        key = key.replace(reUpper, (l) => "-" + l.toLowerCase());

        var value = node.getAttribute("data-" + key);

        if (value != null) {
            var firstSymbol = value[0];
            var lastSymbol = value[value.length - 1];
            // try to recognize and parse  object notation syntax
            if (firstSymbol === "{" && lastSymbol === "}" || firstSymbol === "[" && lastSymbol === "]") {
                try {
                    value = JSON.parse(value);
                } catch (err) {
                    // just return the value itself
                }
            }
        }

        return value;
    };

register({
    /**
     * Private properties accessor
     * @memberof! $Element#
     * @alias $Element#data
     * @param  {String|Object}      name    style property name or key/value object
     * @param  {String|Function}    [value] style property value or functor
     * @return {String|$Element} a property value or reference to <code>this</code>
     * @example
     * link.data("prop");              // => private property prop
     * link.data("prop", {a: "b"});    // update private property _prop
     */
    data(name, value) {
        var node = this[0],
            data = this._;

        if (typeof name === "string") {
            if (arguments.length === 1) {
                if (!(name in data)) {
                    data[name] = readPrivateProperty(node, name);
                }

                return data[name];
            } else {
                data[name] = value;
            }
        } else if (isArray(name)) {
            return name.reduce((memo, key) => {
                return memo[key] = this.get(key), memo;
            }, {});
        } else if (name && typeof name === "object") {
            keys(name).forEach((key) => { this.data(key, name[key]) });
        } else {
            throw new MethodError("data", arguments);
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
