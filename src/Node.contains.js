define(["Node"], function($Node, $Element, $CompositeElement, _forEach, _makeError) {
    "use strict";

    // CONTAINS
    // --------

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
         * @param  {$Element} element element to check
         * @return {Boolean} true if success
         * @example
         * DOM.find("html").contains(DOM.find("body"));
         * // returns true
         */
        $Node.prototype.contains = function(element) {
            var node = this._node, result;

            if (element.nodeType === 1) {
                result = containsElement(node, element);
            } else if (element instanceof $Element) {
                result = element.every(function(element) {
                    return containsElement(node, element._node);
                });
            } else {
                throw _makeError("contains", this);
            }

            return result;
        };
    })();
});
