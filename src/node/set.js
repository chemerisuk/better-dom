import { $Node } from "./index";
import { $Element } from "../element/index";
import { isArray, keys } from "../util/index";
import { MethodError } from "../errors";
import PROP from "../util/accessorhooks";

/**
 * Set property/attribute value by name
 * @memberof! $Node#
 * @alias $Node#set
 * @param {String|Object|Array}   name    property/attribute name
 * @param {String|Function}       value   property/attribute value or functor
 * @return {$Node}
 * @example
 * link.set("title", "mytitle");   // set title property
 * link.set("data-custom", "foo"); // set custom attribute data-custom
 */
$Node.prototype.set = function(name, value) {
    const node = this["<%= prop() %>"];
    const hook = PROP.set[name];

    if (!node) return this;

    if (typeof name === "string") {
        if (typeof value === "function") {
            value = value(this);
        }

        if (hook) {
            hook(node, value);
        } else if (value == null && this instanceof $Element) {
            node.removeAttribute(name);
        } else if (name in node) {
            node[name] = value;
        } else if (this instanceof $Element) {
            node.setAttribute(name, value);
        }
    } else if (isArray(name)) {
        name.forEach((key) => { this.set(key, value) });
    } else if (typeof name === "object") {
        keys(name).forEach((key) => { this.set(key, name[key]) });
    } else {
        throw new MethodError("set", arguments);
    }

    return this;
};
