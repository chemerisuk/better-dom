define(["Node"], function(DOMNode, MockElement) {
    "use strict";
    
    // DOM ELEMENT
    // -----------

    /**
     * Prototype for a DOM element
     * @name DOMElement
     * @constructor
     * @param element native element
     * @extends DOMNode
     * @private
     */
    function DOMElement(element) {
        if (!(this instanceof DOMElement)) {
            return element ? element.__dom__ || new DOMElement(element) : new MockElement();
        }

        DOMNode.call(this, element);
    }

    DOMElement.prototype = new DOMNode();
    DOMElement.prototype.constructor = DOMElement;
});
