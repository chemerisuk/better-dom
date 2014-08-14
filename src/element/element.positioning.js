import _ from "../helpers";
import { MethodError } from "../errors";
import { DOCUMENT } from "../constants";
import { $Element, DOM } from "../types";
import SelectorMatcher from "../util/selectormatcher";

var hooks = {};

/**
 * Check if the element matches selector
 * @memberof! $Element#
 * @alias $Element#matches
 * @param  {String}   selector  css selector for checking
 * @return {$Element}
 */
$Element.prototype.matches = function(selector) {
    if (!selector || typeof selector !== "string") throw new MethodError("matches");

    var checker = hooks[selector] || SelectorMatcher(selector),
        node = this._._node;

    return node && !!checker(node, this);
};

// $Element.matches hooks

hooks[":focus"] = (node) => node === DOCUMENT.activeElement;

hooks[":hidden"] = (node, el) => {
    return node.getAttribute("aria-hidden") === "true" ||
        _.computeStyle(node).display === "none" || !DOM.contains(el);
};

hooks[":visible"] = (node, el) => !hooks[":hidden"](node, el);
