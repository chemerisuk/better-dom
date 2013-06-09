define(["Helpers"], function() {
    "use strict";

    // DOMNode
    // -------

    /**
     * Prototype for a DOM node
     * @name DOMNode
     * @param node native object
     * @constructor
     * @private
     */
    function DOMNode(node) {
        this._node = node;
        this._data = {};
        this._listeners = [];

        if (node) node.__dom__ = this;
    }

    DOMNode.prototype = { };
});