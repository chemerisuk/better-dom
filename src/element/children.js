import _ from "../util/index";
import { MethodError } from "../errors";
import { DOM2_EVENTS } from "../const";
import { $Element, $NullElement } from "../types";
import SelectorMatcher from "../util/selectormatcher";

var makeMethod = (all) => function(selector) {
    if (all) {
        if (selector && typeof selector !== "string") throw new MethodError("children", arguments);
    } else {
        if (selector && typeof selector !== "number") throw new MethodError("child", arguments);
    }

    var node = this[0],
        matcher = SelectorMatcher(selector),
        children = node.children;

    if (!DOM2_EVENTS) {
        // fix IE8 bug with children collection
        children = _.filter.call(children, (node) => node.nodeType === 1);
    }

    if (all) {
        if (matcher) children = _.filter.call(children, matcher);

        return _.map.call(children, $Element);
    } else {
        if (selector < 0) selector = children.length + selector;

        return $Element(children[selector]);
    }
};

_.assign($Element.prototype, {
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
    child: makeMethod(false),

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
    children: makeMethod(true)
});

_.assign($NullElement.prototype, {
    child: function() {
        return new $NullElement();
    },
    children: function() {
        return [];
    }
});
