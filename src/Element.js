define(["Node"], function(DOMNode, MockElement) {
    "use strict";
    
    // DOMElement
    // ----------

    /**
     * Prototype for elements in better-dom
     * @name DOMElement
     * @constructor
     * @param element native element
     * @extends DOMNode
     */
    function DOMElement(element) {
        if (!(this instanceof DOMElement)) {
            return element ? element.__dom__ || new DOMElement(element) : new MockElement();
        }

        DOMNode.call(this, element);

        if (element) element.__dom__ = this;
    }

    DOMElement.prototype = new DOMNode();
});