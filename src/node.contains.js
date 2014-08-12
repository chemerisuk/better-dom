import _ from "./util/index";
import { $Element } from "./index";

/**
 * Check if element is inside of context
 * @memberOf $Element.prototype
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Element.prototype.contains = function(element) {
    var node = this._._node;

    if (element instanceof $Element) {
        return node && element.every((el) => {
            var otherNode = el._._node;

            if (otherNode === node) return true;

            if (node.contains) {
                return node.contains(otherNode);
            } else {
                return node.compareDocumentPosition(otherNode) & 16;
            }
        });
    }

    throw _.makeError("contains");
};
