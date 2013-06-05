define(["Node", "Element", "Collection"], function(DOMNode, DOMElement, DOMCollection) {
    "use strict";

    // Mock Element
    // ------------

    function MockElement() {
        DOMNode.call(this, null);
    }

    MockElement.prototype = new DOMElement();

    _.forIn(DOMElement.prototype, function(functor, key) {
        var isSetter = key in DOMCollection.prototype;

        MockElement.prototype[key] = isSetter ? function() { return this; } : function() { };
    });

    _.forEach("next prev find firstChild lastChild".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new MockElement(); };
    });

    _.forEach("nextAll prevAll children findAll".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new DOMCollection(); };
    });

    // fix constructor property
    _.forEach([DOMNode, DOMElement, MockElement, DOMCollection], function(ctr) {
        ctr.prototype.constructor = ctr;
    });
});