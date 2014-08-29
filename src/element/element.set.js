import _ from "../helpers";
import { MethodError } from "../errors";
import { DOM2_EVENTS, LEGACY_ANDROID } from "../constants";
import { $Element } from "../types";
import PROP from "../util/accessorhooks";

/**
 * Set property/attribute value by name
 * @memberof! $Element#
 * @alias $Element#set
 * @param {String|Object|Array} [name]  property/attribute name
 * @param {String|Function}     value   property/attribute value or function that returns it
 * @return {$Element}
 */
$Element.prototype.set = function(name, value) {
    var node = this[0];

    if (!node) return this;

    // handle the value shortcut
    if (arguments.length === 1 && typeof name !== "object") {
        value = name == null ? "" : String(name);
        name = "value" in node ? "value" : "innerHTML";
    }

    var hook = PROP.set[name],
        watchers = this._._watchers[name],
        oldValue = watchers && this.get(name);

    if (hook) {
        hook(node, value);
    } else if (typeof name === "string") {
        if (name[0] === "-" && name[1] === "-") {
            this._[name.substr(2)] = value;
        } else {
            if (typeof value === "function") value = value(this);

            if (value == null) {
                node.removeAttribute(name);
            } else if (name in node) {
                node[name] = value;
            } else {
                node.setAttribute(name, value);
            }

            // always trigger reflow manually for IE8 and legacy Android
            if (!DOM2_EVENTS || LEGACY_ANDROID) node.className = node.className;
        }
    } else if (_.isArray(name)) {
        name.forEach((key) => { this.set(key, value) });
    } else if (typeof name === "object") {
        _.keys(name).forEach((key) => { this.set(key, name[key]) });
    } else {
        throw new MethodError("set");
    }

    if (watchers && oldValue !== value) {
        watchers.forEach((w) => { setTimeout(() => { w.call(this, value, oldValue) }, 0) });
    }

    return this;
};
