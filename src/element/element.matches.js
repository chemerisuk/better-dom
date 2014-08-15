import { MethodError } from "../errors";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";
import HOOK from "../util/selectorhooks";

/**
 * Check if the element matches selector
 * @memberof! $Element#
 * @alias $Element#matches
 * @param  {String}   selector  css selector for checking
 * @return {$Element}
 */
$Element.prototype.matches = function(selector) {
    if (!selector || typeof selector !== "string") throw new MethodError("matches");

    var checker = HOOK[selector] || SelectorMatcher(selector),
        node = this[0];

    return node && !!checker(node, this);
};
