var _ = require("./utils"),
    $Element = require("./element");
/**
 * Calculates offset of the current element
 * @return object with left, top, bottom, right, width and height properties
 */
$Element.prototype.offset = function() {
    if (this._node) {
        var boundingRect = this._node.getBoundingClientRect(),
            clientTop = _.docEl.clientTop,
            clientLeft = _.docEl.clientLeft,
            scrollTop = window.pageYOffset || _.docEl.scrollTop,
            scrollLeft = window.pageXOffset || _.docEl.scrollLeft;

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
