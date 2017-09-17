import { $Element } from "../element/index";
import { filter, map } from "../util/index";
import { MethodError } from "../errors";
import SelectorMatcher from "../util/selectormatcher";

function makeMethod(all) {
    return function(selector) {
        if (all) {
            if (selector && typeof selector !== "string") {
                throw new MethodError("children", arguments);
            }
        } else {
            if (selector && typeof selector !== "number") {
                throw new MethodError("child", arguments);
            }
        }

        const node = this["<%= prop() %>"];
        const matcher = SelectorMatcher(selector);
        const children = node ? node.children : [];

        if (all) {
            if (matcher) {
                return filter.call(children, matcher).map($Element);
            } else {
                return map.call(children, $Element);
            }
        } else {
            if (selector < 0) selector = children.length + selector;

            return $Element(children[selector]);
        }
    };
}

/**
 * Return child element by index filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#child
 * @param  {Number} index child index
 * @return {$Element} a matched child
 * @function
 * @example
 * ul.child(0);  // => the first <li>
 * ul.child(2);  // => 3th child <li>
 * ul.child(-1); // => last child <li>
 */
$Element.prototype.child = makeMethod(false);

/**
 * Fetch children elements filtered by optional selector
 * @memberof! $Element#
 * @alias $Element#children
 * @param  {String} [selector] css selector
 * @return {Array.<$Element>} an array of all matched elements
 * @function
 * @example
 * ul.children();       // => array with all child <li>
 * ul.children(".foo"); // => array with of child <li> with class "foo"
 */
$Element.prototype.children = makeMethod(true);
