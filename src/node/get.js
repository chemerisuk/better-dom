import { $Node } from "./index";
import { $NewElement } from "../element/index";
import { isArray } from "../util/index";
import { MethodError } from "../errors";
import PROP from "../util/accessorhooks";

/**
 * Get property or attribute value by name
 * @memberof! $Node#
 * @alias $Node#get
 * @param  {String|Array}  name  property or attribute name or array of names
 * @return {String|Object} a value of property or attribute
 * @example
 * link.get("title");       // => property title
 * link.get("data-custom"); // => custom attribute data-custom
 */
$Node.prototype.get = function(name, defaultValue) {
    const node = this["<%= prop() %>"];
    const hook = PROP.get[name];
    var value;

    if (!node) return value;

    if (hook) {
        value = hook(node, name);
    } else if (typeof name === "string") {
        if (name in node) {
            value = node[name];
        } else if (this instanceof $NewElement) {
            value = node.getAttribute(name);
        } else {
            value = null;
        }
    } else if (isArray(name)) {
        value = name.reduce((memo, key) => {
            return memo[key] = this.get(key), memo;
        }, {});
    } else {
        throw new MethodError("get", arguments);
    }

    return value != null ? value : defaultValue;
};
