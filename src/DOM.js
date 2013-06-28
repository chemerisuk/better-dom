define(["Node"], function(DOMNode) {
    "use strict";

    // GLOBAL API
    // ----------

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends DOMNode
     */
    var DOM = new DOMNode(document);

    DOM.version = "<%= pkg.version %>";
});