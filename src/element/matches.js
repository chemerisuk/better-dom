import { $Element } from "./index";
import { MethodError } from "../errors";
import SelectorMatcher from "../util/selectormatcher";
import HOOK from "../util/selectorhooks";

/**
 * Check if element matches a specified selector
 * @param  {String} selector css selector for checking
 * @return {Boolean} `true` if matches and `false` otherwise
 * @example
 * DOM.find("body").matches("html>body"); // => true
 * DOM.find("body").matches("body>html"); // => false
 */
$Element.prototype.matches = function(selector) {
    if (!selector || typeof selector !== "string") {
        throw new MethodError("matches", arguments);
    }

    const checker = HOOK[selector] || SelectorMatcher(selector);

    return !!checker(this[0]);
};
