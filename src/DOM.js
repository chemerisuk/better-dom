define(["Node"], function(DOMNode) {
    "use strict";

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends DOMNode
     */
    // jshint unused:false
    var DOM = new DOMNode(document);
});