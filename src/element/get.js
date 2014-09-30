import _ from "../util/index";
import { MethodError } from "../errors";
import { $Element } from "../types";
import PROP from "../util/accessorhooks";

var reDash = /[A-Z]/g,
    getPrivateProperty = (node, key) => {
        // convert from camel case to dash-separated value
        var value = node.getAttribute("data-" + key.replace(reDash, (l) => "-" + l.toLowerCase()));

        if (value != null) {
            // try to recognize and parse  object notation syntax
            if (value[0] === "{" && value[value.length - 1] === "}") {
                try {
                    value = JSON.parse(value);
                } catch (err) { }
            }
        }

        return value;
    };

/**
 * Get property or attribute value by name
 * @memberof! $Element#
 * @alias $Element#get
 * @param  {String|Array} [name] property or attribute name or array of names
 * @return {String|Object} a value of property or attribute
 * @example
 * link.get("title");       // => property title
 * link.get("data-custom"); // => custom attribute data-custom
 * link.get();              // => link's innerHTML
 * link.get("_prop");       // => private property _prop
 */
$Element.prototype.get = function(name) {
    var node = this[0],
        hook = PROP.get[name];

    if (!node) return;

    if (hook) return hook(node, name);

    if (typeof name === "string") {
        if (name in node) {
            return node[name];
        } else if (name[0] !== "_") {
            return node.getAttribute(name);
        } else {
            let key = name.substr(1),
                data = this._,
                value;

            if (key in data) {
                value = data[key];
            } else {
                value = data[key] = getPrivateProperty(node, key);
            }

            return value;
        }
    } else if (_.isArray(name)) {
        return name.reduce((r, key) => { return r[key] = this.get(key), r }, {});
    } else {
        throw new MethodError("get");
    }
};
