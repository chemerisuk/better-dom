import { HTML } from "./constants";

// use a random property name to link JS wrappers and
// native DOM elements.
var wrapperProp = "__" + Math.random().toString().substr(2) + "__";

/**
 * Used to represent a DOM element
 * @class $Element
 * @private
 */
function $Element(node) {
    if (node && node[wrapperProp]) return node[wrapperProp];

    if (this instanceof $Element) {
        if (node && node.nodeType === 1) {
            node[wrapperProp] = this;

            this[0] = node;
        }

        this._ = { _handlers: [], _watchers: {} };
    } else {
        return new $Element(node);
    }
}

$Element.prototype = {
    constructor: (node) => new $Element(node),
    toString: function() {
        var node = this[0];

        return node ? node.tagName.toLowerCase() : "";
    }
};

/**
 * Global object to access the DOM
 * @namespace DOM
 * @extends $Element
 * @example
 * You can use `DOM.constructor` to create a native element wrapper:
 * ```js
 * var bodyEl = DOM.constructor(document.body);
 * bodyEl.hide();
 * ```
 */
var DOM = new $Element(HTML);

DOM.VERSION = "<%= pkg.version %>";

export { $Element, DOM };
