define(["Node", "Element", "Collection"], function(DOMNode, DOMElement, DOMCollection, _forEach, _forIn) {
    "use strict";

    // MOCK ELEMENT
    // ------------

    function MockElement() {
        DOMNode.call(this, null);
    }

    MockElement.prototype = new DOMElement();
    MockElement.prototype.constructor = MockElement;

    _forIn(DOMElement.prototype, function(functor, key) {
        var isSetter = key in DOMCollection.prototype;

        MockElement.prototype[key] = isSetter ? function() { return this; } : function() { };
    });

    _forEach("next prev find child clone".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new MockElement(); };
    });

    _forEach("nextAll prevAll children findAll".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new DOMCollection(); };
    });
});
