import $Node from "./node";

var DOM = new $Node(document);

DOM.version = "<%= pkg.version %>";

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Node
 */
export default window.DOM = DOM;
