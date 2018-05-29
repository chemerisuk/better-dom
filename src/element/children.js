import { $Element } from "../element/index";
import { filter, map } from "../util/index";
import { MethodError } from "../errors";
import SelectorMatcher from "../util/selectormatcher";

function makeMethod(methodName, validSelectorType) {
    return function(selector) {
        if (selector && typeof selector !== validSelectorType) {
            throw new MethodError(methodName, arguments);
        }

        const node = this[0];
        const matcher = SelectorMatcher(selector);
        const children = node ? node.children : [];

        if (typeof selector === "number") {
            if (selector < 0) {
                selector = children.length + selector;
            }

            return $Element(children[selector]);
        } else {
            if (matcher) {
                return filter.call(children, matcher).map($Element);
            } else {
                return map.call(children, $Element);
            }
        }
    };
}

/**
 * Return child element by index filtered by optional selector
 * @param  {Number} index child index
 * @return {$Element} A matched child element
 * @function
 * @example
 * ul.child(0);  // => the first <li>
 * ul.child(2);  // => 3th child <li>
 * ul.child(-1); // => last child <li>
 */
$Element.prototype.child = makeMethod("child", "number");

/**
 * Fetch children elements filtered by optional selector
 * @param  {String} [selector] css selector
 * @return {Array.<$Element>} An array of all matched elements
 * @function
 * @example
 * ul.children();       // => array with all child <li>
 * ul.children(".foo"); // => array with of child <li> with class "foo"
 */
$Element.prototype.children = makeMethod("children", "string");
