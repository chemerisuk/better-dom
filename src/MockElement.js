define(["Node", "Element", "Collection"], function(DOMNode, DOMElement, DOMElementCollection) {
    "use strict";

    // Mock Element
    // ------------

    function MockElement() {
        DOMNode.call(this, null);
    }

    MockElement.prototype = new DOMElement();

    _.forIn(DOMElement.prototype, function(functor, key) {
        var isSetter = key in DOMElementCollection.prototype;

        MockElement.prototype[key] = isSetter ? function() { return this; } : function() { };
    });

    _.forEach("next prev find firstChild lastChild".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new MockElement(); };
    });

    _.forEach("nextAll prevAll children findAll".split(" "), function(key) {
        MockElement.prototype[key] = function() { return new DOMElementCollection(); };
    });

    // fix constructor property
    _.forEach([DOMNode, DOMElement, MockElement], function(ctr) {
        ctr.prototype.constructor = ctr;
    });
});