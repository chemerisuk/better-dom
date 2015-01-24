import { register } from "../util/index";
import { MethodError } from "../errors";
import { $Element } from "../types";
import { RETURN_FALSE } from "../const";

register({
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
    contains: function(element) {
        var node = this[0];

        if (element instanceof $Element) {
            var otherNode = element[0];

            if (otherNode === node) return true;
            /* istanbul ignore else */
            if (node.contains) {
                return node.contains(otherNode);
            } else {
                return node.compareDocumentPosition(otherNode) & 16;
            }
        }

        throw new MethodError("contains", arguments);
    }
}, null, () => RETURN_FALSE);
