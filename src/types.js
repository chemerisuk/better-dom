import { DOCUMENT } from "./const";

function $NullElement() {}

/**
 * Used to represent an element in better-dom
 * @class $Element
 */
function $Element(node) {
    if (this instanceof $Element) {
        if (node) {
            // use a generated property to store a reference
            // to the wrapper for circular object binding
            node["<%= prop() %>"] = this;

            this[0] = node;
            this._ = {
                "<%= prop('handler') %>": [],
                "<%= prop('watcher') %>": {},
                "<%= prop('extension') %>": [],
                "<%= prop('context') %>": {}
            };
        }
    } else if (node) {
        var cached = node["<%= prop() %>"];
        // create a wrapper only once for each native element
        return cached ? cached : new $Element(node);
    } else {
        return new $NullElement();
    }
}

/**
 * Used to represent a document in better-dom
 * @class $Document
 * @extends {$Element}
 */
function $Document(node) {
    // use documentElement for a $Document wrapper
    return $Element.call(this, node.documentElement);
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
        var nodeType = node && node.nodeType,
            ctr = nodeType === 9 ? $Document : $Element;
        // filter non elements like text nodes, comments etc.
        return ctr(nodeType === 1 || nodeType === 9? node : null);
    },
    toString() {
        var node = this[0];

        return node ? "<" + node.tagName.toLowerCase() + ">" : "";
    },
    version: "<%= pkg.version %>"
};

$NullElement.prototype = new $Element();

$Document.prototype = new $Element();

export { $Element, $NullElement, $Document };
