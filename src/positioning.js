import _ from "./utils";
import $Node from "./node";
import $Element from "./element";
import SelectorMatcher from "./selectormatcher";

var hooks = {};

/**
 * Various methods related to positioning
 * @module positioning
 */

/**
 * Check if element is inside of context
 * @memberOf module:positioning
 * @param  {$Element} element element to check
 * @return {Boolean} true if success
 */
$Node.prototype.contains = function(element) {
    var node = this._._node;

    if (element instanceof $Element) {
        return node && element.every((el) => {
            var otherNode = el._._node;

            if (otherNode === node) return true;

            return node.contains ? node.contains(otherNode) : node.compareDocumentPosition(otherNode) & 16;
        });
    }

    throw _.makeError("contains");
};

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

    return node && !!checker(node);
};

// $Element.matches hooks

hooks[":focus"] = (node) => node === document.activeElement;

hooks[":hidden"] = (node) => {
    return node.getAttribute("aria-hidden") === "true" ||
        _.computeStyle(node).display === "none" || !_.docEl.contains(node);
};

hooks[":visible"] = (node) => !hooks[":hidden"](node);
