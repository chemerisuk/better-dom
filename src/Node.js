define(["Helpers"], function() {
    "use strict";

    // DOM NODE
    // --------

    /**
     * Prototype for a DOM node
     * @name DOMNode
     * @param node native object
     * @constructor
     * @private
     */
    function DOMNode(node) {
        if (node) {
            this._node = node;
            this._data = {};
            this._listeners = [];

            node.__dom__ = this;
        }
    }

    DOMNode.prototype = {
        constructor: DOMNode
    };
});