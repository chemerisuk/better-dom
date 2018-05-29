import { $Element } from "../element/index";
import { WINDOW } from "../const";

/**
 * Calculates offset of the current element
 * @return {Object} An object with left, top, bottom, right, width and height properties
 * @example
 * el.offset(); // => {left: 1, top: 2, right: 3, bottom: 4, width: 2, height: 2}
 */
$Element.prototype.offset = function() {
    const node = this[0];
    const result = {top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0};

    if (node) {
        const docEl = (node.ownerDocument || node).documentElement;
        const clientTop = docEl.clientTop;
        const clientLeft = docEl.clientLeft;
        const scrollTop = WINDOW.pageYOffset || docEl.scrollTop;
        const scrollLeft = WINDOW.pageXOffset || docEl.scrollLeft;
        const boundingRect = node.getBoundingClientRect();

        result.top = boundingRect.top + scrollTop - clientTop;
        result.left = boundingRect.left + scrollLeft - clientLeft;
        result.right = boundingRect.right + scrollLeft - clientLeft;
        result.bottom = boundingRect.bottom + scrollTop - clientTop;
        result.width = boundingRect.right - boundingRect.left;
        result.height = boundingRect.bottom - boundingRect.top;
    }

    return result;
};
