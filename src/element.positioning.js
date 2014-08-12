import _ from "./util";
import { $Element } from "./index";
import SelectorMatcher from "./util/selectormatcher";

/**
 * Positioning helpers
 * @module positioning
 */

var hooks = {};

/**
 * Calculates offset of the current element
 * @memberOf module:positioning
 * @return object with left, top, bottom, right, width and height properties
 */
$Element.prototype.offset = function() {
    var node = this._._node,
        clientTop = _.docEl.clientTop,
        clientLeft = _.docEl.clientLeft,
        scrollTop = window.pageYOffset || _.docEl.scrollTop,
        scrollLeft = window.pageXOffset || _.docEl.scrollLeft,
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
 * @memberOf module:positioning
 * @param  {String}   selector  css selector for checking
 * @return {$Element}
 */
$Element.prototype.matches = function(selector) {
    if (!selector || typeof selector !== "string") throw _.makeError("matches");

    var checker = hooks[selector] || SelectorMatcher(selector),
        node = this._._node;

    return node && !!checker(node, this);
};

// $Element.matches hooks

hooks[":focus"] = (node) => node === document.activeElement;

hooks[":hidden"] = (node, el) => {
    return node.getAttribute("aria-hidden") === "true" ||
        _.computeStyle(node).display === "none" || !DOM.contains(el);
};

hooks[":visible"] = (node, el) => !hooks[":hidden"](node, el);
