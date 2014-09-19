import { $Element } from "../types";

/**
 * Remove all child nodes from the DOM
 * @memberof! $Element#
 * @alias $Element#empty
 * @return {$Element}
 */
$Element.prototype.empty = function() {
    var node = this[0], child;

    if (node) {
        while (child = node.firstChild) {
            node.removeChild(child);
        }
    }

    return this;
};
