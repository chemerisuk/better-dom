import _ from "../util/index";
import { MethodError } from "../errors";
import { JSCRIPT_VERSION, LEGACY_ANDROID } from "../const";
import PROP from "../util/accessorhooks";

_.register({
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
    set(name, value) {
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
            watchers = this._["<%= prop('watcher') %>"][name],
            oldValue;

        if (watchers) {
            oldValue = this.get(name);
        }

        if (typeof name === "string") {
            if (name[0] === "_") {
                this._[name.slice(1)] = value;
            } else {
                if (typeof value === "function") {
                    value = value(this);
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
                /* istanbul ignore if */
                if (JSCRIPT_VERSION < 9 || LEGACY_ANDROID) {
                    // always trigger reflow manually for IE8 and legacy Android
                    node.className = node.className;
                }
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
                _.safeCall(this, w, value, oldValue);
            });
        }

        return this;
    }
});

/**
 * Callback function for changing a property/attribute
 * @callback setterCallback
 * @param {$Element} el the current element
 * @return {Object} a new value for property/attribute
 */
