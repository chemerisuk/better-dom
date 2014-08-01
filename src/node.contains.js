import _ from "./utils";
import $Node from "./node";
import $Element from "./element";

/**
 * Check if element is inside of context
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Node.prototype.contains = function(element) {
    var node = this._._node;

    if (element instanceof $Element) {
        return node && element.every((el) => {
            var otherNode = el._._node;

            if (otherNode === node) return true;

            return node.contains ? node.contains(otherNode) : node.compareDocumentPosition(otherNode) & 16;
        });
    }

    throw _.makeError("contains");
};
