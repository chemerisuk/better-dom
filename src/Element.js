define(["Node"], function(DOMNode, DOMCollection) {
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
            return element ? element.__dom__ || new DOMElement(element) : new DOMCollection();
        }

        DOMNode.call(this, element);

        if (element) {
            Array.prototype.push.call(this, this);
        }
    }

    DOMElement.prototype = new DOMNode();
    DOMElement.prototype.constructor = DOMElement;
});
