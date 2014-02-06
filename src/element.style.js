/**
 * Changing of element styles support
 * @module styles
 */
var _ = require("./utils"),
    $Element = require("./element"),
    styleAccessor = require("./styleaccessor");

/**
 * CSS getter/setter for an element
 * @memberOf module:styles
 * @param  {String|Object}   name    style property name or key/value object
 * @param  {String|Function} [value] style property value or function that returns it
 * @return {String|$Element} property value or reference to this
 */
$Element.prototype.style = function(name, value) {
    var len = arguments.length,
        node = this._node,
        nameType = typeof name,
        style, hook, computed;

    if (len === 1 && (nameType === "string" || Array.isArray(name))) {
        if (node) {
            style = node.style;

            value = _.foldl(nameType === "string" ? [name] : name, function(memo, name) {
                hook = styleAccessor.get[name];
                value = hook ? hook(style) : style[name];

                if (!computed && !value) {
                    style = _.getComputedStyle(node);
                    value = hook ? hook(style) : style[name];

                    computed = true;
                }

                memo[name] = value;

                return memo;
            }, {});
        }

        return node && nameType === "string" ? value[name] : value;
    }

    return this.legacy(function(node, el, index, ref) {
        var style = node.style,
            appendCssText = function(value, key) {
                var hook = styleAccessor.set[key];

                if (typeof value === "function") value = value(el, index, ref);

                if (value == null) value = "";

                if (hook) {
                    hook(style, value);
                } else {
                    style[key] = typeof value === "number" ? value + "px" : value.toString();
                }
            };

        if (len === 1 && name && nameType === "object") {
            _.forOwn(name, appendCssText);
        } else if (len === 2 && nameType === "string") {
            appendCssText(value, name);
        } else {
            throw _.makeError("style");
        }
    });
};
