var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.set.hooks"),
    features = require("./features");

/**
 * Set property/attribute value
 * @param {String}           [name]  property/attribute name
 * @param {String|Function}  value   property/attribute value
 * @return {$Element}
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.set = function(name, value) {
    var len = arguments.length,
        originalName = name,
        originalValue = value,
        nameType = typeof name;

    return _.legacy(this, function(node, el, index) {
        var hook;

        name = originalName;
        value = originalValue;

        if (len === 1) {
            if (name == null) {
                value = "";
            } else if (nameType === "object") {
                return _.forOwn(name, function(value, name) { el.set(name, value) });
            } else {
                // handle numbers, booleans etc.
                value = nameType === "function" ? name : String(name);
            }

            if (node.tagName === "SELECT") {
                // selectbox has special case
                if (_.every(node.options, function(o) { return !(o.selected = o.value === value) })) {
                    node.selectedIndex = -1;
                }

                return;
            } else if (node.type && "value" in node) {
                // for IE use innerText because it doesn't trigger onpropertychange
                name = features.DOM2_EVENTS ? "value" : "innerText";
            } else {
                name = "innerHTML";
            }
        } else if (len > 2 || len === 0 || nameType !== "string") {
            throw _.makeError("set", el);
        }

        if (typeof value === "function") {
            value = value(value.length ? el.get(name) : undefined, index, el);
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
    });
};
