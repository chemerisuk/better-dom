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
    var nameType = typeof name;

    if (arguments.length === 1 && nameType !== "object") {
        value = name;
        name = undefined;
    }

    return this.each((el, node) => {
        var hook = PROP.set[name],
            watchers = (el._._watchers || {})[name || ("value" in node ? "value" : "innerHTML")],
            newValue = value, oldValue;

        if (watchers) oldValue = el.get(name);

        if (typeof name === "string" && name.substr(0, 2) === "--") {
            el._[name.substr(2)] = newValue;
        } else {
            if (typeof newValue === "function") newValue = value(el, node);

            if (hook) {
                hook(node, newValue);
            } else if (nameType !== "string") {
                if (name && nameType === "object") {
                    return _.keys(name).forEach((key) => { el.set(key, name[key]) });
                }

                throw new MethodError("set");
            } else if (newValue == null) {
                node.removeAttribute(name);
            } else if (name in node) {
                node[name] = newValue;
            } else {
                node.setAttribute(name, newValue);
            }

            // always trigger reflow manually for IE8 and legacy Android
            if (!DOM2_EVENTS || LEGACY_ANDROID) node.className = node.className;
        }

        if (watchers && oldValue !== newValue) {
            watchers.forEach((w) => { el.dispatch(w, newValue, oldValue) });
        }
    });
};
