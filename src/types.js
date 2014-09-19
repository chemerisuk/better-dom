import { HTML } from "./constants";

// use a random property name to link JS wrappers and
// native DOM elements.
var wrapperProp = "__" + Math.random().toString(32).substr(2) + "__";

/**
 * Used to represent a DOM element
 * @class $Element
 * @private
 */
function $Element(node) {
    if (node && node[wrapperProp]) return node[wrapperProp];

    if (this instanceof $Element) {
        if (node) {
            node[wrapperProp] = this;

            this[0] = node;
        }

        this._ = { _handlers: [], _watchers: {} };
    } else {
        return new $Element(node);
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
     * bodyEl.hide();
     */
    constructor(node) {
        return new $Element(node && node.nodeType === 1 ? node : null);
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
