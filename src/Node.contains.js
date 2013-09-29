define(["Node"], function($Node, $Element, _makeError) {
    "use strict";

    // CONTAINS
    // --------

    /**
     * Check if element is inside of context
     * @param  {$Element} element element to check
     * @return {Boolean} true if success
     */
    $Node.prototype.contains = function(element) {
        var node = this._node, result;

        if (element instanceof $Element) {
            result = element.every(function(element) {
                return node.contains(element._node);
            });
        } else {
            throw _makeError("contains", this);
        }

        return result;
    };
});
