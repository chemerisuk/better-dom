import _ from "../util/index";
import { MethodError } from "../errors";
import { DOM2_EVENTS, LEGACY_ANDROID } from "../const";
import { $Element, $NullElement } from "../types";
import PROP from "../util/accessorhooks";

/**
 * Set property/attribute value by name
 * @memberof! $Element#
 * @alias $Element#set
 * @param {String|Object|Array}   [name]  property/attribute name
 * @param {String|setterCallback} value   property/attribute value or {@link setterCallback}
 * @return {$Element}
 * @example
 * link.set("title", "mytitle"); // set title property
 * link.set("data-custom");      // set custom attribute data-custom
 * link.set("inner html");       // set link's innerHTML
 * link.set("_prop", {a: "b"});  // update private property _prop
 */
$Element.prototype.set = function(name, value) {
    var node = this[0];

    // handle the value shortcut
    if (arguments.length === 1) {
        if (typeof name === "function") {
            value = name;
        } else {
            value = name == null ? "" : String(name);
        }

        if (value !== "[object Object]") {
            let tag = node.tagName;

            if (tag === "INPUT" || tag === "TEXTAREA" ||  tag === "SELECT" || tag === "OPTION") {
                name = "value";
            } else {
                name = "innerHTML";
            }
        }
    }

    var hook = PROP.set[name],
        watchers = this._._watchers[name],
        oldValue;

    if (watchers || typeof value === "function") {
        oldValue = this.get(name);
    }

    if (typeof name === "string") {
        if (name[0] === "_") {
            this._[name.substr(1)] = value;
        } else {
            if (typeof value === "function") {
                value = value.call(this, oldValue);
            }

            if (hook) {
                hook(node, value);
            } else if (value == null) {
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
        throw new MethodError("set", arguments);
    }

    if (watchers && oldValue !== value) {
        watchers.forEach((w) => {
            _.safeInvoke(this, w, value, oldValue);
        });
    }

    return this;
};

$NullElement.prototype.set = function() {
    return this;
};

/**
 * Callback function for changing a property/attribute
 * @callback setterCallback
 * @param {Object} currentValue current value of property/attribute
 * @return {Object} a new value for property/attribute
 */

