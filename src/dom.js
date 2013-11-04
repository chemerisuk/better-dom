var $Node = require("./node"),
    DOM = new $Node(document);

DOM.version = "<%= pkg.version %>";

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Node
 */
module.exports = window.DOM = DOM;
