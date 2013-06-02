define(["Utils", "Helpers"], function(createElement) {
    "use strict";

    // DOMNode
    // -------

    /**
     * Prototype for limited/protected elements in better-dom
     * @name DOMNode
     * @constructor
     * @private
     * @param node native object
     */
    function DOMNode(node) {
        this._node = node;
        this._data = {};
        this._listeners = [];
    }

    DOMNode.prototype = {};
});