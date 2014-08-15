import _ from "../helpers";
import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../constants";
import { $Element, DOM } from "../types";
import SelectorMatcher from "../util/selectormatcher";

function makeTraversingMethod(methodName, propertyName, all) {
    return function(selector, andSelf) {
        if (selector && typeof selector !== "string") throw new MethodError(methodName);

        var matcher = SelectorMatcher(selector),
            nodes = all ? [] : null,
            it = this._._node;

        for (it = it && !andSelf ? it[propertyName] : it; it; it = it[propertyName]) {
            if (it.nodeType === 1 && (!matcher || matcher(it))) {
                if (!all) return $Element(it);

                nodes.push(it);
            }
        }

        return DOM.constructor(nodes);
    };
}

function makeChildTraversingMethod(all) {
    return function(selector) {
        if (all) {
            if (selector && typeof selector !== "string") throw new MethodError("children");
        } else {
            if (selector && typeof selector !== "number") throw new MethodError("child");
        }

        var node = this._._node,
            children = node ? node.children : null;

        if (!node) return all ? [] : new $Element();

        if (!DOM2_EVENTS) {
            // fix IE8 bug with children collection
            children = _.filter.call(children, (node) => node.nodeType === 1);
        }

        if (all) return DOM.constructor(selector ? _.filter.call(children, SelectorMatcher(selector)) : children);

        if (selector < 0) selector = children.length + selector;

        return $Element(children[selector]);
    };
}

/**
 * Find next sibling element filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#next
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} matched element
 * @function
 */
$Element.prototype.next = makeTraversingMethod("next", "nextSibling");

/**
 * Find previous sibling element filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#prev
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} matched element
 * @function
 */
$Element.prototype.prev = makeTraversingMethod("prev", "previousSibling");

/**
 * Find all next sibling elements filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#nextAll
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {Array} collection of matched elements
 * @function
 */
$Element.prototype.nextAll = makeTraversingMethod("nextAll", "nextSibling", true);

/**
 * Find all previous sibling elements filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#prevAll
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {Array} collection of matched elements
 * @function
 */
$Element.prototype.prevAll = makeTraversingMethod("prevAll", "previousSibling", true);

/**
 * Find parent element filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#parent
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} matched element
 * @function
 */
$Element.prototype.parent = makeTraversingMethod("parent", "parentNode");

/**
 * Return child element by index filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#child
 * @param  {Number} index child index
 * @return {$Element} matched child
 * @function
 */
$Element.prototype.child = makeChildTraversingMethod(false);

/**
 * Fetch children elements filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#children
 * @param  {String} [selector] css selector
 * @return {Array} collection of matched elements
 * @function
 */
$Element.prototype.children = makeChildTraversingMethod(true);
