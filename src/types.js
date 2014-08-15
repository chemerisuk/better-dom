import { WINDOW, HTML } from "./constants";

/**
 * Used to represent a DOM element
 * @class $Element
 * @private
 */
function $Element(node) {
    if (node && node.__dom__) return node.__dom__;

    if (this instanceof $Element) {
        if (node) {
            node.__dom__ = this;

            this[0] = node;
        }

        this._ = { _handlers: [], _watchers: {}, _visibility: "" };
    } else {
        return new $Element(node);
    }
}

$Element.prototype.toString = function() {
    var node = this[0];

    return node ? node.tagName.toLowerCase() : "";
};

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Element
 */
var DOM = new $Element(HTML);

DOM.version = "<%= pkg.version %>";

WINDOW.DOM = DOM; /* expose DOM namespace globally */

export { $Element, DOM };
