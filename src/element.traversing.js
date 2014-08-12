import _ from "./util/index";
import { $Element, $Elements } from "./index";
import SelectorMatcher from "./util/selectormatcher";

/**
 * Element traversing support
 * @module traversing
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */

function makeTraversingMethod(methodName, propertyName, all) {
    return function(selector, andSelf) {
        if (selector && typeof selector !== "string") throw _.makeError(methodName);

        var matcher = SelectorMatcher(selector),
            nodes = all ? [] : null,
            it = this._._node;

        for (it = it && !andSelf ? it[propertyName] : it; it; it = it[propertyName]) {
            if (it.nodeType === 1 && (!matcher || matcher(it))) {
                if (!all) return $Element(it);

                nodes.push(it);
            }
        }

        return new $Elements(nodes);
    };
}

function makeChildTraversingMethod(all) {
    return function(selector) {
        if (all) {
            if (selector && typeof selector !== "string") throw _.makeError("children");
        } else {
            if (selector && typeof selector !== "number") throw _.makeError("child");
        }

        var node = this._._node,
            children = node ? node.children : null;

        if (!node) return new $Element();

        if (!_.DOM2_EVENTS) {
            // fix IE8 bug with children collection
            children = this.filter.call(children, (node) => node.nodeType === 1);
        }

        if (all) return new $Elements(selector ? this.filter.call(children, SelectorMatcher(selector)) : children);

        if (selector < 0) selector = children.length + selector;

        return $Element(children[selector]);
    };
}

/**
 * Find next sibling element filtered by optional selector
 * @memberOf module:traversing
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} matched element
 * @function
 */
$Element.prototype.next = makeTraversingMethod("next", "nextSibling");

/**
 * Find previous sibling element filtered by optional selector
 * @memberOf module:traversing
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} matched element
 * @function
 */
$Element.prototype.prev = makeTraversingMethod("prev", "previousSibling");

/**
 * Find all next sibling elements filtered by optional selector
 * @memberOf module:traversing
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} collection of matched elements
 * @function
 */
$Element.prototype.nextAll = makeTraversingMethod("nextAll", "nextSibling", true);

/**
 * Find all previous sibling elements filtered by optional selector
 * @memberOf module:traversing
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} collection of matched elements
 * @function
 */
$Element.prototype.prevAll = makeTraversingMethod("prevAll", "previousSibling", true);

/**
 * Find parent element filtered by optional selector
 * @memberOf module:traversing
 * @param {String} [selector] css selector
 * @param {Boolean} [andSelf] if true than search will start from the current element
 * @return {$Element} matched element
 * @function
 */
$Element.prototype.parent = makeTraversingMethod("parent", "parentNode");

/**
 * Return child element by index filtered by optional selector
 * @memberOf module:traversing
 * @param  {Number} index child index
 * @return {$Element} matched child
 * @function
 */
$Element.prototype.child = makeChildTraversingMethod(false);

/**
 * Fetch children elements filtered by optional selector
 * @memberOf module:traversing
 * @param  {String} [selector] css selector
 * @return {$Element} collection of matched elements
 * @function
 */
$Element.prototype.children = makeChildTraversingMethod(true);
