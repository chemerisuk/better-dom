var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.set.hooks");

/**
 * Set property/attribute value
 * @param {String} [name] property/attribute name
 * @param {String} value property/attribute value
 * @return {$Element}
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.set = function(name, value) {
    var len = arguments.length,
        nameType = typeof name;

    return _.legacy(this, function(node, el) {
        var initialName, hook;

        if (len === 1) {
            if (name == null) {
                value = "";
            } else if (nameType === "object") {
                return _.forOwn(name, function(value, name) { el.set(name, value) });
            } else {
                // handle numbers, booleans etc.
                value = nameType === "function" ? name : String(name);
            }

            initialName = name;

            if (node.type && "value" in node) {
                // for IE use innerText because it doesn't trigger onpropertychange
                name = window.addEventListener || node.tagName === "SELECT" ? "value" : "innerText";
            } else {
                name = "innerHTML";
            }
        } else if (len > 2 || len === 0 || nameType !== "string") {
            throw _.makeError("set", el);
        }

        if (typeof value === "function") {
            value = value.call(el, value.length ? el.get(name) : undefined);
        }

        if (hook = hooks[name]) {
            hook(node, value);
        } else if (value == null) {
            node.removeAttribute(name);
        } else if (name in node) {
            node[name] = value;
        } else {
            node.setAttribute(name, value);
        }

        if (initialName) {
            name = initialName;
            value = undefined;
        }
    });
};
