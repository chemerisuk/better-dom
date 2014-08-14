import { HTML, WINDOW } from "../constants";
import { $Element } from "../types";

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
