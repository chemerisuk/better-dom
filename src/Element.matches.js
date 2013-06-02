define(["Element"], function(DOMElement, SelectorMatcher, makeError) {
    "use strict";

    /**
     * Check if the element matches selector
     * @memberOf DOMElement.prototype
     * @param  {String} selector css selector
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.matches = function(selector) {
        if (!selector || typeof selector !== "string") {
            throw makeError("matches");
        }

        return new SelectorMatcher(selector).test(this._node);
    };
});