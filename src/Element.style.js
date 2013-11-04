var _ = require("./utils"),
    $Element = require("./element"),
    hooks = require("./element.style.hooks");

/**
 * CSS getter/setter for an element
 * @param  {String} name    style property name
 * @param  {String} [value] style property value
 * @return {String|Object} property value or reference to this
 */
$Element.prototype.style = function(name, value) {
    var len = arguments.length,
        node = this._node,
        nameType = typeof name,
        style, hook;

    if (len === 1 && nameType === "string") {
        if (!node) return;

        style = node.style;
        hook = hooks.get[name];

        value = hook ? hook(style) : style[name];

        if (!value) {
            style = _.getComputedStyle(node);
            value = hook ? hook(style) : style[name];
        }

        return value;
    }

    return _.legacy(this, function(node, el) {
        var appendCssText = function(value, key) {
            var hook = hooks.set[key];

            if (typeof value === "function") {
                value = value.call(el, value.length ? el.style(key) : undefined);
            }

            if (value == null) value = "";

            if (hook) {
                hook(node.style, value);
            } else {
                node.style[key] = typeof value === "number" ? value + "px" : value.toString();
            }
        };

        if (len === 1 && name && nameType === "object") {
            _.forOwn(name, appendCssText);
        } else if (len === 2 && nameType === "string") {
            appendCssText(value, name);
        } else {
            throw _.makeError("style", el);
        }
    });
};


