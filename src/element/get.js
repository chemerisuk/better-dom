import { register, isArray } from "../util/index";
import { MethodError } from "../errors";
import PROP from "../util/accessorhooks";

register({
    /**
     * Get property or attribute value by name
     * @memberof! $Element#
     * @alias $Element#get
     * @param  {String|Array}  name  property or attribute name or array of names
     * @return {String|Object} a value of property or attribute
     * @example
     * link.get("title");       // => property title
     * link.get("data-custom"); // => custom attribute data-custom
     */
    get(name) {
        var node = this[0],
            hook = PROP.get[name];

        if (hook) return hook(node, name);

        if (typeof name === "string") {
            if (name in node) {
                return node[name];
            } else {
                return node.getAttribute(name);
            }
        } else if (isArray(name)) {
            return name.reduce((memo, key) => {
                return memo[key] = this.get(key), memo;
            }, {});
        } else {
            throw new MethodError("get", arguments);
        }
    }
}, null, () => function() {});
