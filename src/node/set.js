import { MethodError } from "../errors";
import { $Node } from "./index";
import { $Element } from "../element/index";
import { isArray, keys } from "../util/index";
import PROP from "../util/accessorhooks";

/**
 * Set property/attribute value by name
 * @param {String|Object|Array|Function} name property/attribute name
 * @param {String|Function} value property/attribute value or functor
 * @return {$Node} Self
 * @example
 * link.set("title", "mytitle");   // set title property
 * link.set("data-custom", "foo"); // set custom attribute data-custom
 */
$Node.prototype.set = function(name, value) {
    const node = this[0];
    const len = arguments.length;
    const hook = PROP.set[name];

    if (node) {
        if (typeof name === "string") {
            if (len === 1) { // innerHTML shortcut
                value = name;
                name = "innerHTML";
            }

            if (typeof value === "function") {
                value = value(this.get(name));
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
            if (len === 1) {
                node.textContent = ""; // clear node children
                this.append.apply(this, name);
            } else {
                name.forEach((key) => { this.set(key, value) });
            }
        } else if (typeof name === "object") {
            keys(name).forEach((key) => { this.set(key, name[key]) });
        } else {
            throw new MethodError("set", arguments);
        }
    }

    return this;
};
