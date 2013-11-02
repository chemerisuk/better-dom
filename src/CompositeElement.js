define(["Element"], function($Element, _map) {
    "use strict";

    /**
     * Used to represent a collection of DOM elements (length >= 1)
     * @name $CompositeElement
     * @param elements {Array|Object} array or array-like object with native elements
     * @extends $Element
     * @constructor
     * @private
     */
    function $CompositeElement(elements) {
        Array.prototype.push.apply(this, _map(elements, $Element));
    }

    $CompositeElement.prototype = new $Element();
});
