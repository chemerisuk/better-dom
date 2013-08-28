define(["Node"], function($Node, $NullElement) {
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
            return element ? new $Element(element) : new $NullElement();
        }

        $Node.call(this, element);

        if (element) {
            Array.prototype.push.call(this, element.__dom__ = this);
        }
    }

    $Element.prototype = new $Node();
});
