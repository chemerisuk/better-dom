define(["Helpers"], function() {
    "use strict";

    // DOM NODE
    // --------

    /**
     * Used to represent a DOM node
     * @name $Node
     * @param node {Object} native node
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

    $Node.prototype = {};
});
