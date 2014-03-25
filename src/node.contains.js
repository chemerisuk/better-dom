import _ from "./utils";
import $Node from "./node";
import $Element from "./element";

/**
 * Ancestor check support
 * @module contains
 */

/**
 * Check if element is inside of context
 * @memberOf module:contains
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Node.prototype.contains = function(element) {
    var node = this._._node;

    if (element instanceof $Element) {
        return node && element.every((el) => node.contains(el._._node));
    }

    throw _.makeError("contains");
};
