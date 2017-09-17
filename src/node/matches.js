import { $Node } from "./index";
import { $Element } from "../element/index";
import { MethodError } from "../errors";
import SelectorMatcher from "../util/selectormatcher";
import HOOK from "../util/selectorhooks";

/**
 * Check if the element matches selector
 * @memberof! $Node#
 * @alias $Node#matches
 * @param  {String}   selector  css selector for checking
 * @return {Boolean} returns <code>true</code> if success and <code>false</code> otherwise
 * @example
 * DOM.find("body").matches("html>body"); // => true
 * DOM.find("body").matches("body>html"); // => false
 */
$Node.prototype.matches = function(selector) {
    if (!selector || typeof selector !== "string") {
        throw new MethodError("matches", arguments);
    }

    const checker = HOOK[selector] || SelectorMatcher(selector);

    return !!checker(this["<%= prop() %>"]);
};
