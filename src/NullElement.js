define(["Node", "Element", "Collection"], function(DOMNode, DOMElement, DOMCollection, _extend, _forIn) {
    "use strict";

    // NULL ELEMENT
    // ------------

    function NullElement() { }

    NullElement.prototype = new DOMElement(null);

    _forIn(NullElement.prototype, function(value, key, proto) {
        if (typeof value !== "function") return;

        if (key in DOMCollection.prototype) {
            proto[key] = function() { return this; };
        } else {
            proto[key] = function() { };
        }
    });

    NullElement.prototype.constructor = NullElement;
});
