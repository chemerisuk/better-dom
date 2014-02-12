/**
 * Ancestor check support
 * @module contains
 */
var _ = require("./utils"),
    $Node = require("./node"),
    $Element = require("./element");

/**
 * Check if element is inside of context
 * @memberOf module:contains
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Node.prototype.contains = function(element) {
    var node = this._node;

    if (element instanceof $Element) {
        return node && element.every(function(el) { return node.contains(el._node) });
    }

    throw _.makeError("contains");
};
