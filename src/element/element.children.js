import _ from "../helpers";
import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../constants";
import { $Element } from "../types";
import SelectorMatcher from "../util/selectormatcher";

function makeChildrenMethod(all) {
    return function(selector) {
        if (all) {
            if (selector && typeof selector !== "string") throw new MethodError("children");
        } else {
            if (selector && typeof selector !== "number") throw new MethodError("child");
        }

        var node = this[0],
            matcher = SelectorMatcher(selector),
            children = node ? node.children : null;

        if (!node) return all ? [] : new $Element();

        if (!DOM2_EVENTS) {
            // fix IE8 bug with children collection
            children = [for (node of children) if (node.nodeType === 1) node];
        }

        if (all) return [for (n of children) if (matcher && matcher(n)) $Element(n)];

        if (selector < 0) selector = children.length + selector;

        return $Element(children[selector]);
    };
}

_.assign($Element.prototype, {
    /**
     * Return child element by index filtered by optional selector
     * @memberof! $Element#
     * @alias $Element#child
     * @param  {Number} index child index
     * @return {$Element} matched child
     * @function
     */
    child: makeChildrenMethod(false),

    /**
     * Fetch children elements filtered by optional selector
     * @memberof! $Element#
     * @alias $Element#children
     * @param  {String} [selector] css selector
     * @return {Array.<$Element>} an array of all matched element wrappers
     * @function
     */
    children: makeChildrenMethod(true)
});
