var _ = require("./utils"),
    $Node = require("./node"),
    $Element = require("./element");

/**
 * Check if element is inside of context
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Node.prototype.contains = function(element) {
    var node = this._node;

    if (!(element instanceof $Element)) throw _.makeError("contains", this);

    if (node) return element.every(function(el) { return node.contains(el._node) });
};
