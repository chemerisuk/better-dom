define(["Node"], function(DOMNode) {
    "use strict";

    // GLOBAL API
    // ----------

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends DOMNode
     */
    // jshint unused:false
    var DOM = new DOMNode(document);
});