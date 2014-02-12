/**
 * Clonning of an element support
 * @module clone
 */
var _ = require("./utils"),
    $Element = require("./element");

/**
 * Clone element
 * @memberOf module:clone
 * @param {Boolean} [deep=true] true if all children should also be cloned, or false otherwise
 * @return {$Element} clone of current element
 */
$Element.prototype.clone = function(deep) {
    if (!arguments.length) deep = true;

    if (typeof deep !== "boolean") throw _.makeError("clone");

    var node = this._node, result;

    if (node) {
        if (_.DOM2_EVENTS) {
            result = new $Element(node.cloneNode(deep));
        } else {
            result = DOM.create(node.outerHTML);

            if (!deep) result.set("innerHTML", "");
        }
    } else {
        result = new $Element();
    }

    return result;
};
