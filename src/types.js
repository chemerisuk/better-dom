import { HTML } from "./const";

/**
 * Used to represent a DOM element
 * @class $Element
 * @private
 */
function $Element(node) {
    if (this instanceof $Element) {
        if (node) {
            node.__dom__ = this;

            this[0] = node;
        }

        this._ = { _handlers: [], _watchers: {} };
    } else {
        var cached = node && node.__dom__;
        // create a wrapper only once for each native element
        return cached ? cached : new $Element(node);
    }
}

$Element.prototype = {
    /**
     * Create a {@link $Element} for a native DOM element
     * @memberof DOM
     * @alias DOM.constructor
     * @param {Object}  [node]  native element
     * @return {$Element} a wrapper object
     * @example
     * var bodyEl = DOM.constructor(document.body);
     * // bodyEl is an instance of $Element
     * bodyEl.hide();
     */
    constructor(node) {
        // filter non elements like text nodes, comments etc.
        return $Element(node && node.nodeType === 1 ? node : null);
    },
    toString() {
        var node = this[0];

        return node ? node.tagName.toLowerCase() : "";
    }
};

/**
 * Global object to access the DOM
 * @namespace DOM
 * @extends $Element
 */
var DOM = new $Element(HTML);

DOM.VERSION = "<%= pkg.version %>";

export { $Element, DOM };
