define(["Helpers"], function() {
    "use strict";

    // DOM NODE
    // --------

    /**
     * Prototype for a DOM node
     * @name $Node
     * @param node native object
     * @constructor
     * @private
     */
    function $Node(node) {
        if (node) {
            this._node = node;
            this._data = {};
            this._listeners = [];
        }
    }

    $Node.prototype = {
        constructor: $Node
    };
});
