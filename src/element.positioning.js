import _ from "./util/index";
import { HTML, WINDOW, DOCUMENT } from "./util/const";
import { $Element, DOM, MethodError } from "./index";
import SelectorMatcher from "./util/selectormatcher";

var hooks = {};

/**
 * Calculates offset of the current element
 * @memberof! $Element#
 * @alias $Element#offset
 * @return object with left, top, bottom, right, width and height properties
 */
$Element.prototype.offset = function() {
    var node = this._._node,
        clientTop = HTML.clientTop,
        clientLeft = HTML.clientLeft,
        scrollTop = WINDOW.pageYOffset || HTML.scrollTop,
        scrollLeft = WINDOW.pageXOffset || HTML.scrollLeft,
        boundingRect;

    if (node) {
        boundingRect = node.getBoundingClientRect();

        return {
            top: boundingRect.top + scrollTop - clientTop,
            left: boundingRect.left + scrollLeft - clientLeft,
            right: boundingRect.right + scrollLeft - clientLeft,
            bottom: boundingRect.bottom + scrollTop - clientTop,
            width: boundingRect.right - boundingRect.left,
            height: boundingRect.bottom - boundingRect.top
        };
    }
};

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
