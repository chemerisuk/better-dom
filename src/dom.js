var $Node = require("./node"),
    DOM = new $Node(document);

DOM.version = "<%= pkg.version %>";
DOM.template = function(str) { return str };

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Node
 */
module.exports = window.DOM = DOM;
