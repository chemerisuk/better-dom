define(["Element"], function($Element, _forEach, _forIn, _map) {
    "use strict";

    // COMPOSITE ELEMENT
    // -----------------

    /**
     * Read-only array-like collection of elements
     * @name $CompositeElement
     * @constructor
     * @extends $Element
     * @private
     */
    function $CompositeElement(elements) {
        Array.prototype.push.apply(this, _map(elements, $Element));
    }

    $CompositeElement.prototype = new $Element();
    $CompositeElement.prototype.constructor = $CompositeElement;

    _forIn($CompositeElement.prototype, function(value, key, proto) {
        if (typeof value !== "function") return;

        if (~value.toString().indexOf("return this;")) {
            proto[key] = function() {
                var args = arguments;

                return _forEach(this, function(el) {
                    value.apply(el, args);
                });
            };
        } else {
            proto[key] = function() {};
        }
    });
});
