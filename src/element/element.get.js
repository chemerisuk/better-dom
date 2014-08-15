import _ from "../helpers";
import { MethodError } from "../errors";
import { $Element } from "../types";
import PROP from "../util/accessorhooks";

/**
 * Get property or attribute value by name
 * @memberof! $Element#
 * @alias $Element#get
 * @param  {String|Array} [name] property/attribute name or array of names
 * @return {Object} property/attribute value
 */
$Element.prototype.get = function(name) {
    var data = this._,
        node = this[0],
        hook = PROP.get[name],
        nameType = typeof name,
        key, value;

    if (!node) return;

    if (hook) return hook(node, name);

    if (nameType === "string") {
        if (name.substr(0, 2) === "--") {
            key = name.substr(2);

            if (key in data) {
                value = data[key];
            } else {
                value = node.getAttribute("data-" + key);

                if (value != null) {
                    // try to recognize and parse  object notation syntax
                    if (value[0] === "{" && value[value.length - 1] === "}") {
                        try {
                            value = JSON.parse(value);
                        } catch (err) { }
                    }

                    data[key] = value;
                }
            }

            return value;
        }

        return name in node ? node[name] : node.getAttribute(name);
    } else if (_.isArray(name)) {
        return name.reduce((r, key) => { return r[key] = this.get(key), r }, {});
    } else {
        throw new MethodError("get");
    }
};
