define(["Node"], function(DOMNode, NullElement) {
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
            return element ? element.__dom__ || new DOMElement(element) : new NullElement();
        }

        DOMNode.call(this, element);
    }

    DOMElement.prototype = new DOMNode();
    DOMElement.prototype.constructor = DOMElement;
});
