var $Node = require("./node"),
    DOM = new $Node(document);

DOM.version = "<%= pkg.version %>";

DOM.importStyles = function() { DOM.importStyles.args.push(arguments) };
DOM.importStyles.args = [];

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Node
 */
module.exports = window.DOM = DOM;
