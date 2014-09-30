import { HTML } from "./const";

/**
 * Used to represent a DOM element
 * @class $Element
 * @private
 */
export function $Element(node) {
    if (this instanceof $Element) {
        if (node) {
            this[0] = node;
            // use a generated on compile time property to store
            // a reference to the wrapper for circular binding
            node["__<%= VERSION_NUMBER %>__"] = this;
        }

        this._ = { _handlers: [], _watchers: {} };
    } else {
        var cached = node && node["__<%= VERSION_NUMBER %>__"];
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
    },
    valueOf() {
        return "<%= VERSION_NUMBER %>";
    }
};

/**
 * Global object to access the DOM
 * @namespace DOM
 * @extends $Element
 */
export var DOM = new $Element(HTML);
