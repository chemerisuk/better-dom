import { MethodError } from "../errors";
import { $Element, $NullElement } from "../types";

/**
 * Check if element is inside of context
 * @memberof! $Element#
 * @alias $Element#contains
 * @param  {$Element} element element to check
 * @return {Boolean} returns <code>true</code> if success and <code>false</code> otherwise
 * @example
 * DOM.contains(DOM.find("body")); // => true
 * DOM.find("body").contains(DOM); // => false
 */
$Element.prototype.contains = function(element) {
    var node = this[0];

    if (element instanceof $Element) {
        var otherNode = element[0];

        if (otherNode === node) return true;

        if (node.contains) {
            return node.contains(otherNode);
        } else {
            return node.compareDocumentPosition(otherNode) & 16;
        }
    }

    throw new MethodError("contains");
};

$NullElement.prototype.contains = function() {
    return false;
};
