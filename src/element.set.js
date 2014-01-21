var _ = require("./utils"),
    $Element = require("./element"),
    hooks = {},
    fakeClass = _.makeRandomProp();

/**
 * Set property/attribute value by name
 * @param {String}           [name]  property/attribute name
 * @param {String|Function}  value   property/attribute value or function that returns it
 * @return {$Element}
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.set = function(name, value) {
    var nameType = typeof name;

    if (arguments.length === 1 && nameType !== "object") {
        value = name;
        name = undefined;
    }

    return this.legacy(function(node, el, index, ref) {
        var hook = hooks[name],
            str = value;

        if (typeof str === "function") str = value(el, index, ref);

        if (hook || nameType === "string") {
            if (hook) {
                hook(node, str);
            } else if (str == null) {
                node.removeAttribute(name);
            } else if (name in node) {
                node[name] = str;
            } else {
                node.setAttribute(name, str);
            }
        } else if (nameType === "object") {
            return _.forOwn(name, function(value, name) { el.set(name, value) });
        } else {
            throw _.makeError("set");
        }

        // trigger reflow manually in IE8
        if (!_.DOM2_EVENTS) {
            str = (node.className += " " + fakeClass);
            node.className = str.replace(" " + fakeClass, "");
        }
    });
};

// $Element.set hooks

hooks.undefined = function(node, value) {
    var name;
    // handle numbers, booleans etc.
    value = value == null ? "" : String(value);

    if (node.tagName === "SELECT") {
        // selectbox has special case
        if (_.every(node.options, function(o) { return !(o.selected = o.value === value) })) {
            node.selectedIndex = -1;
        }
    } else if (node.type && "value" in node) {
        // for IE use innerText because it doesn't trigger onpropertychange
        name = _.DOM2_EVENTS ? "value" : "innerText";
    } else {
        name = "innerHTML";
    }

    if (name) node[name] = value;
};

if (!_.DOM2_EVENTS) {
    hooks.textContent = function(node, value) {
        node.innerText = value;
    };
}

module.exports = hooks;
