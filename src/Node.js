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

            Array.prototype.push.call(this, node.__dom__ = this);
        } else {
            this.length = 0;
        }
    }

    $Node.prototype = {};
});
