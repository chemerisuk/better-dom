var _ = require("./utils"),
    $Element = require("./element"),
    hooks = {};

/**
 * Get property or attribute by name
 * @param  {String} [name] property/attribute name
 * @return {String} property/attribute value
 * @see https://github.com/chemerisuk/better-dom/wiki/Getter-and-setter
 */
$Element.prototype.get = function(name) {
    var node = this._node,
        hook = hooks[name];

    if (!node) return;

    if (name === undefined) {
        if (node.tagName === "OPTION") {
            name = node.hasAttribute("value") ? "value" : "text";
        } else if (node.tagName === "SELECT") {
            return node.options[node.selectedIndex].value;
        } else {
            name = node.type && "value" in node ? "value" : "innerHTML";
        }
    } else if (typeof name !== "string") {
        throw _.makeError("get", this);
    }

    return hook ? hook(node, name) : (name in node ? node[name] : node.getAttribute(name));
};

hooks.type = function(node) {
    // some browsers don't recognize input[type=email] etc.
    return node.getAttribute("type") || node.type;
};

if (!("textContent" in document.documentElement)) {
    hooks.textContent = function(node) { return node.innerText };
}
