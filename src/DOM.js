define(["Node"], function($Node) {
    "use strict";

    // GLOBAL API
    // ----------

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends $Node
     */
    var DOM = new $Node(document);

    DOM.version = "<%= pkg.version %>";
});