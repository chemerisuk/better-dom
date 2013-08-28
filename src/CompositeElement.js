define(["Element"], function($Element, _forEach, _forIn, _map) {
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

    _forIn($CompositeElement.prototype, function(value, key, proto) {
        if (typeof value === "function") {
            var isGetter = value.toString().indexOf("return this;") < 0,
                // this will be the arguments object
                functor = function(el) { value.apply(el, this); };

            proto[key] = isGetter ? function() {} : function() {
                return _forEach(this, functor, arguments);
            };
        }
    });
});
