import { HTML, WINDOW } from "./constants";

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
        if (node) {
            node[wrapperProp] = this;

            this[0] = node;
        }

        this._ = { _handlers: [], _watchers: {}, _visibility: "" };
    } else {
        return new $Element(node);
    }
}

$Element.prototype = {
    toString: function() {
        var node = this[0];

        return node ? node.tagName.toLowerCase() : "";
    }
};

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Element
 */
var DOM = new $Element(HTML);

DOM.VERSION = "<%= pkg.version %>";

export { $Element, DOM };
