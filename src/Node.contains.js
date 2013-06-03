define(["Node"], function(DOMNode, DOMElement, DOMElementCollection) {
    "use strict";

    (function() {
        var containsElement;

        if (document.documentElement.contains) {
            containsElement = function(parent, child) {
                return parent.contains(child);
            };
        } else {
            containsElement = function(parent, child) {
                return !!(parent.compareDocumentPosition(child) & 16);
            };
        }
        
        /**
         * Check if element is inside of context
         * @memberOf DOMNode.prototype
         * @param  {DOMElement} element element to check
         * @return {Boolean} true if success
         * @example
         * DOM.find("html").contains(DOM.find("body"));
         * // returns true
         */
        DOMNode.prototype.contains = function(element, /*INTERNAL*/reverse) {
            var node = this._node, result = true;

            if (element.nodeType === 1) {
                result = containsElement(reverse ? element : node, reverse ? node : element);
            } else if (element instanceof DOMElement) {
                result = element.contains(node, true);
            } else if (element instanceof DOMElementCollection) {
                element.each(function(element) {
                    result = result && element.contains(node, true);
                });
            } else {
                throw this.makeError("contains");
            }

            return result;
        };
    })();
});