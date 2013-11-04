// GLOBAL NAMESPACE
// ----------------

var $Node = require("./node"),
    /**
     * Global object to access DOM
     * @namespace DOM
     * @extends $Node
     */
    DOM = new $Node(document);

DOM.version = "<%= pkg.version %>";

// register global variable
module.exports = window.DOM = DOM;
