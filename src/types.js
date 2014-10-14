import { HTML } from "./const";

function $NullElement() {}

/**
 * Used to represent a DOM element
 * @class $Element
 */
function $Element(node) {
    if (this instanceof $Element) {
        if (node) {
            this[0] = node;
            // use a generated property to store a reference
            // to the wrapper for circular object binding
            node["__<%= VERSION_NUMBER %>__"] = this;
        }

        this._ = { _handlers: [], _watchers: {}, _extensions: [] };
    } else if (node) {
        var cached = node["__<%= VERSION_NUMBER %>__"];
        // create a wrapper only once for each native element
        return cached ? cached : new $Element(node);
    } else {
        return new $NullElement();
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

        return node ? "<" + node.tagName.toLowerCase() + ">" : "";
    },
    version: "<%= pkg.version %>"
};

$NullElement.prototype = new $Element();

/**
 * Global object to access the DOM
 * @namespace DOM
 * @extends $Element
 */
var DOM = new $Element(HTML);

/**
 * Register mixins for every {@link $Element} instance
 * @memberof DOM
 * @alias DOM.register
 * @param {Object}           mixins key-value  map of methods
 * @param {registerCallback} [defaultBehavior] implementation for empty nodes
 * @function
 */
DOM.register = (mixins, defaultBehavior) => {
    defaultBehavior = defaultBehavior || function() {};

    Object.keys(mixins).forEach((key) => {
        var defaults = defaultBehavior(key) || function() { return this };

        $Element.prototype[key] = mixins[key];
        $NullElement.prototype[key] = defaults;
    });
};

/**
 * A factory for default implementation for empty nodes
 * @callback registerCallback
 * @param  {String} methodName name of the method to implement
 * @return {Function} a function with implementation
 */

export { $Element, $NullElement, DOM };
