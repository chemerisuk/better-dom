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

    // handle vthe alue shortcut
    if (arguments.length === 1 && typeof name !== "object") {
        value = name == null ? "" : String(name);
        name = "value" in node ? "value" : "innerHTML";
    }

    var hook = PROP.set[name],
        nameType = typeof name,
        watchers = this._._watchers[name],
        newValue = value, oldValue;

    if (watchers) oldValue = this.get(name);

    if (hook) {
        hook(node, newValue);
    } else if (nameType === "string") {
        if (name[0] === "-" && name[1] === "-") {
            this._[name.substr(2)] = newValue;
        } else {
            if (typeof newValue === "function") newValue = value(this);

            if (newValue == null) {
                node.removeAttribute(name);
            } else if (name in node) {
                node[name] = newValue;
            } else {
                node.setAttribute(name, newValue);
            }

            // always trigger reflow manually for IE8 and legacy Android
            if (!DOM2_EVENTS || LEGACY_ANDROID) node.className = node.className;
        }
    } else if (nameType === "object") {
        if (_.isArray(name)) {
            name.forEach((key) => { this.set(key, value) });
        } else {
            _.keys(name).forEach((key) => { this.set(key, name[key]) });
        }
    } else {
        throw new MethodError("set");
    }

    if (watchers && oldValue !== newValue) {
        watchers.forEach((w) => { this.dispatch(w, newValue, oldValue) });
    }

    return this;
};
