define(["Helpers"], function() {
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

        if (node) node.__dom__ = this;
    }

    DOMNode.prototype = {
        /**
         * Always returns string "DOMElement"
         * @memberOf DOMNode.prototype
         * @return {String} "DOMElement" string
         */
        toString: function() {
            return "DOMNode";
        },
        makeError: function(method) {
            return "Error: " + this + "." + method + " was called with illegal arguments. Check <%= pkg.docs %>" + this + ".html#" + method + " to verify the function call";
        }
    };
});