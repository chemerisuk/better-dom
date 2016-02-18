import { register, isArray, keys, safeCall } from "../util/index";
import { MethodError } from "../errors";
import { RETURN_THIS } from "../const";
import PROP from "../util/accessorhooks";

register({
    /**
     * Set property/attribute value by name
     * @memberof! $Element#
     * @alias $Element#set
     * @param {String|Object|Array}   name    property/attribute name
     * @param {String|Function}       value   property/attribute value or functor
     * @return {$Element}
     * @example
     * link.set("title", "mytitle");   // set title property
     * link.set("data-custom", "foo"); // set custom attribute data-custom
     */
    set(name, value) {
        var node = this[0];

        var hook = PROP.set[name],
            watchers = this._["<%= prop('watcher') %>"],
            oldValue;

        watchers = watchers && watchers[name];

        if (watchers) {
            oldValue = this.get(name);
        }

        if (typeof name === "string") {
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
        } else if (isArray(name)) {
            name.forEach((key) => { this.set(key, value) });
        } else if (typeof name === "object") {
            keys(name).forEach((key) => { this.set(key, name[key]) });
        } else {
            throw new MethodError("set", arguments);
        }

        if (watchers && oldValue !== value) {
            watchers.forEach((w) => {
                safeCall(this, w, value, oldValue);
            });
        }

        return this;
    }
}, null, () => RETURN_THIS);
