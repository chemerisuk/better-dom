import _ from "../helpers";
import { MethodError } from "../errors";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";

var makeTraversingMethod = (methodName, propertyName, all) => function(selector) {
        if (selector && typeof selector !== "string") throw new MethodError(methodName);

        var matcher = SelectorMatcher(selector),
            nodes = all ? [] : null,
            it = this[0];

        for (it = it && it[propertyName]; it; it = it[propertyName]) {
            if (it.nodeType === 1 && (!matcher || matcher(it))) {
                if (!all) break;

                nodes.push(it);
            }
        }

        return all ? _.map.call(nodes, $Element) : $Element(it);
    };

_.assign($Element.prototype, {
    /**
     * Find next sibling element filtered by optional selector
     * @memberof! $Element#
     * @alias $Element#next
     * @param {String} [selector] css selector
     * @return {$Element} matched element wrapper
     * @function
     */
    next: makeTraversingMethod("next", "nextSibling"),

    /**
     * Find previous sibling element filtered by optional selector
     * @memberof! $Element#
     * @alias $Element#prev
     * @param {String} [selector] css selector
     * @return {$Element} matched element wrapper
     * @function
     */
    prev: makeTraversingMethod("prev", "previousSibling"),

    /**
     * Find all next sibling elements filtered by optional selector
     * @memberof! $Element#
     * @alias $Element#nextAll
     * @param {String} [selector] css selector
     * @return {Array.<$Element>} an array of all matched element wrappers
     * @function
     */
    nextAll: makeTraversingMethod("nextAll", "nextSibling", true),

    /**
     * Find all previous sibling elements filtered by optional selector
     * @memberof! $Element#
     * @alias $Element#prevAll
     * @param {String} [selector] css selector
     * @return {Array.<$Element>} an array of all matched element wrappers
     * @function
     */
    prevAll: makeTraversingMethod("prevAll", "previousSibling", true),

    /**
     * Find parent element filtered by optional selector
     * @memberof! $Element#
     * @alias $Element#parent
     * @param {String} [selector] css selector
     * @return {$Element} matched element wrapper
     * @function
     */
    parent: makeTraversingMethod("parent", "parentNode")
});
