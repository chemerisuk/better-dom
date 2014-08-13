export { $Element, $Collection, DOM };

/**
 * Used to represent a DOM element
 * @class $Element
 * @private
 */
function $Element(node) {
    if (node && node.__dom__) return node.__dom__;

    if (this instanceof $Element) {
        if (node) this[0] = node.__dom__ = this;

        this._ = { _node: node, _handlers: [] };
        this.length = node ? 1 : 0;
    } else {
        return new $Element(node);
    }
}

$Element.prototype.toString = function() {
    var node = this._._node;

    return node ? node.tagName.toLowerCase() : "";
};

/**
 * Used to represent a collection of DOM elements
 * @class $Collection
 * @extends $Element
 * @private
 */
function $Collection(elements) {
    for (var i = 0, n = elements && elements.length || 0; i < n; ++i) {
        this[i] = $Element(elements[i]);
    }

    this._ = {};
    this.length = n;
}

$Collection.prototype = new $Element();
$Collection.prototype.toString = Array.prototype.join;

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Element
 */
var DOM = new $Element(document.documentElement);

DOM.version = "<%= pkg.version %>";
DOM.constructor = (node) => new $Element(node);

window.DOM = DOM;
