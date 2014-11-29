import { NODE_DATA, HANDLERS_DATA, WATCHERS_DATA, EXTENSIONS_DATA, CONTEXT_DATA } from "./const";

function $NullElement() {}

/**
 * Used to represent an element in better-dom
 * @class $Element
 */
function $Element(node) {
    if (this instanceof $Element) {
        if (node) {
            this[0] = node;
            // use a generated property to store a reference
            // to the wrapper for circular object binding
            node[NODE_DATA] = this;

            this._ = {};
            this._[HANDLERS_DATA] = [];
            this._[WATCHERS_DATA] = {};
            this._[EXTENSIONS_DATA] = [];
            this._[CONTEXT_DATA] = {};
        }


    } else if (node) {
        var cached = node[NODE_DATA];
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
 * Used to represent a document in better-dom
 * @class $Document
 * @extends {$Element}
 */
function $Document(node) {
    if (node && node.nodeType === 9) {
        node = node.documentElement;
    }

    $Element.call(this, node);
}

$Document.prototype = new $Element();

/**
 * Global object to access the DOM
 * @namespace DOM
 * @extends {$Document}
 */
var DOM = new $Document(document);

/**
 * A factory for default implementation for empty nodes
 * @callback registerCallback
 * @param  {String} methodName name of the method to implement
 * @return {Function} a function with implementation
 */

export { $Element, $NullElement, $Document, DOM };
