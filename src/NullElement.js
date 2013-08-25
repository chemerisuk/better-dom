define(["CompositeElement"], function($CompositeElement) {
    "use strict";

    /**
     * Used to indicate an empty DOM element (length == 0)
     * @name $NullElement
     * @extends $CompositeElement
     * @constructor
     * @private
     */
    function $NullElement() {}

    $NullElement.prototype = new $CompositeElement();
    $NullElement.prototype.constructor = $NullElement;
});
