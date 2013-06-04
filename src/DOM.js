define(["Node"], function(DOMNode) {
    "use strict";

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends DOMNode
     */
    var DOM = new DOMNode(document);

    DOM.toString = function() {
        return "DOM";
    };
});