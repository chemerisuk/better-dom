define(["Node"], function(DOMNode, DOMElement, DOMElementCollection, makeError, supports) {
    "use strict";

    /**
     * Check if element is inside of context
     * @memberOf DOMNode.prototype
     * @param  {DOMElement} element element to check
     * @return {Boolean} true if success
     * @function
     * @example
     * DOM.find("html").contains(DOM.find("body"));
     * // returns true
     */
    (function() {
        var containsElement;

        if (supports("contains", "a")) {
            containsElement = function(parent, child) {
                return parent.contains(child);
            };
        } else {
            containsElement = function(parent, child) {
                return !!(parent.compareDocumentPosition(child) & 16);
            };
        }
        
        DOMNode.prototype.contains = function(element, /*INTERNAL*/reverse) {
            var node = this._node, result = true;

            if (element instanceof Element) {
                result = containsElement(reverse ? element : node, reverse ? node : element);
            } else if (element instanceof DOMElement) {
                result = element.contains(node, true);
            } else if (element instanceof DOMElementCollection) {
                element.each(function(element) {
                    result = result && element.contains(node, true);
                });
            } else {
                throw makeError("contains");
            }

            return result;
        };
    })();
});