define(["Node"], function($Node, $CompositeElement) {
    "use strict";
    
    // DOM ELEMENT
    // -----------

    /**
     * Prototype for a DOM element
     * @name $Element
     * @constructor
     * @param element native element
     * @extends $Node
     * @private
     */
    function $Element(element) {
        if (!(this instanceof $Element)) {
            return element ? element.__dom__ || new $Element(element) : new $CompositeElement();
        }

        $Node.call(this, element);

        if (element) {
            Array.prototype.push.call(this, this);
        }
    }

    $Element.prototype = new $Node();
    $Element.prototype.constructor = $Element;
});
