define(["Element"], function($Element, documentElement) {
    "use strict";

    /**
     * Calculates offset of current context
     * @return {{top: Number, left: Number, right: Number, bottom: Number}} offset object
     */
    $Element.prototype.offset = function() {
        var boundingRect = this._node.getBoundingClientRect(),
            clientTop = documentElement.clientTop,
            clientLeft = documentElement.clientLeft,
            scrollTop = window.pageYOffset || documentElement.scrollTop,
            scrollLeft = window.pageXOffset || documentElement.scrollLeft;

        return {
            top: boundingRect.top + scrollTop - clientTop,
            left: boundingRect.left + scrollLeft - clientLeft,
            right: boundingRect.right + scrollLeft - clientLeft,
            bottom: boundingRect.bottom + scrollTop - clientTop
        };
    };

    /**
     * Calculate width based on element's offset
     * @return {Number} element width in pixels
     */
    $Element.prototype.width = function() {
        var offset = this.offset();

        return offset.right - offset.left;
    };

    /**
     * Calculate height based on element's offset
     * @return {Number} element height in pixels
     */
    $Element.prototype.height = function() {
        var offset = this.offset();

        return offset.bottom - offset.top;
    };
});
