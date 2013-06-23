define(["Element"], function(DOMElement, SelectorMatcher, _makeError) {
    "use strict";

    /**
     * Check if the element matches selector
     * @param  {String} selector css selector
     * @return {DOMElement}
     */
    DOMElement.prototype.is = function(selector) {
        if (!selector || typeof selector !== "string") {
            throw _makeError("is", this);
        }

        return new SelectorMatcher(selector).test(this._node);
    };
});