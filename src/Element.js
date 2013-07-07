define(["Node"], function($Node, $CompositeElement) {
    "use strict";
    
    // DOM ELEMENT
    // -----------

    /**
     * Prototype for a DOM element
     * @name $Element
     * @param element native element
     * @extends $Node
     * @constructor
     * @private
     */
    function $Element(element) {
        if (element && element.__dom__) return element.__dom__;

        if (!(this instanceof $Element)) {
            return element ? new $Element(element) : new $CompositeElement();
        }

        $Node.call(this, element);

        if (element) Array.prototype.push.call(this, this);
    }

    $Element.prototype = new $Node();
    $Element.prototype.constructor = $Element;
});
