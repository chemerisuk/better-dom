import { $Element } from "../element/index";
import { WINDOW } from "../const";

/**
 * Calculates offset of the current element
 * @memberof! $Element#
 * @alias $Element#offset
 * @return {Object} object with left, top, bottom, right, width and height properties
 * @example
 * el.offset(); // => {left: 1, top: 2, right: 3, bottom: 4, width: 2, height: 2}
 */
$Element.prototype.offset = function() {
    const node = this["<%= prop() %>"];

    if (!node) {
        return {top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0};
    }

    var docEl = (node.ownerDocument || node).documentElement,
        clientTop = docEl.clientTop,
        clientLeft = docEl.clientLeft,
        scrollTop = WINDOW.pageYOffset || docEl.scrollTop,
        scrollLeft = WINDOW.pageXOffset || docEl.scrollLeft,
        boundingRect = node.getBoundingClientRect();

    return {
        top: boundingRect.top + scrollTop - clientTop,
        left: boundingRect.left + scrollLeft - clientLeft,
        right: boundingRect.right + scrollLeft - clientLeft,
        bottom: boundingRect.bottom + scrollTop - clientTop,
        width: boundingRect.right - boundingRect.left,
        height: boundingRect.bottom - boundingRect.top
    };
};
