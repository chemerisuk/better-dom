import _ from "../util/index";
import { MethodError } from "../errors";
import PROP from "../util/accessorhooks";

var reUpper = /[A-Z]/g,
    readPrivateProperty = (node, key) => {
        // convert from camel case to dash-separated value
        key = key.replace(reUpper, (l) => "-" + l.toLowerCase());

        var value = node.getAttribute("data-" + key);

        if (value != null) {
            // try to recognize and parse  object notation syntax
            if (value[0] === "{" && value[value.length - 1] === "}") {
                try {
                    value = JSON.parse(value);
                } catch (err) {
                    // just return the value itself
                }
            }
        }

        return value;
    };

_.register({
    /**
     * Get property or attribute value by name
     * @memberof! $Element#
     * @alias $Element#get
     * @param  {String|Array}  name  property or attribute name or array of names
     * @return {String|Object} a value of property or attribute
     * @example
     * link.get("title");       // => property title
     * link.get("data-custom"); // => custom attribute data-custom
     * link.get("_prop");       // => private property _prop
     */
    get(name) {
        var node = this[0],
            hook = PROP.get[name];

        if (hook) return hook(node, name);

        if (typeof name === "string") {
            if (name in node) {
                return node[name];
            } else if (name[0] !== "_") {
                return node.getAttribute(name);
            } else {
                let key = name.slice(1),
                    data = this._;

                if (!(key in data)) {
                    data[key] = readPrivateProperty(node, key);
                }

                return data[key];
            }
        } else if (_.isArray(name)) {
            return name.reduce((memo, key) => {
                return memo[key] = this.get(key), memo;
            }, {});
        } else if (name === void 0) {
            // TODO: remove this line in future
            return this.value();
        } else {
            throw new MethodError("get", arguments);
        }
    }
}, () => {
    return () => void 0;
});
