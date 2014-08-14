import { MethodError } from "../errors";
import { $Element } from "../types";

/**
 * Check if element is inside of context
 * @memberof! $Element#
 * @alias $Element#contains
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Element.prototype.contains = function(element) {
    var node = this._._node;

    if (!node) return false;

    if (element instanceof $Element) {
        var otherNode = element._._node;

        if (otherNode === node) return true;

        if (node.contains) {
            return node.contains(otherNode);
        } else {
            return node.compareDocumentPosition(otherNode) & 16;
        }
    }

    throw new MethodError("contains");
};
