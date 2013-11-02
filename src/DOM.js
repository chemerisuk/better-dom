define(["Node"], function($Node) {
    "use strict";

    // GLOBAL NAMESPACE
    // ----------------

    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends $Node
     */
    var DOM = new $Node(document);

    DOM.version = "<%= pkg.version %>";
});