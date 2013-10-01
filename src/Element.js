define(["Node"], function($Node) {
    "use strict";

    // DOM ELEMENT
    // -----------

    /**
     * Used to represent a DOM element (length == 1)
     * @name $Element
     * @param element {Object} native element
     * @extends $Node
     * @constructor
     * @private
     */
    function $Element(element) {
        if (element && element.__dom__) return element.__dom__;

        if (!(this instanceof $Element)) {
            return new $Element(element);
        }

        $Node.call(this, element);
    }

    $Element.prototype = new $Node();
});
