define(["Node"], function($Node, $CompositeElement) {
    "use strict";
    
    // DOM ELEMENT
    // -----------

    /**
     * Array-like object that represents a DOM element/collection. For single element methods
     * behaves according to their description. If an element is empty or it's a collection
     * then getters return an undefined value
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

        if (element) {
            Array.prototype.push.call(this, element.__dom__ = this);
        }
    }

    $Element.prototype = new $Node();
    $Element.prototype.constructor = $Element;
});
