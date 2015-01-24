import { register, isArray, keys } from "../util/index";
import { safeCall } from "../util/index";
import { MethodError } from "../errors";
import { DOM, JSCRIPT_VERSION, LEGACY_ANDROID, RETURN_THIS } from "../const";
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
     * link.set("_prop", {a: "b"});    // update private property _prop
     */
    set(name, value) {
        var node = this[0];

        var hook = PROP.set[name],
            watchers = this._["<%= prop('watcher') %>"][name],
            oldValue;

        if (watchers) {
            oldValue = this.get(name);
        }

        if (arguments.length === 1 && typeof name !== "object") {
            // TODO: remove this check in future
            return this.value(name);
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
