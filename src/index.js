/**
 * Used to represent a DOM node
 * @name $Node
 * @constructor
 * @private
 */
export function $Node(node) {
    if (node) this[0] = node.__dom__ = this;

    this._ = {_node: node, _handlers: []};
    this.length = node ? 1 : 0;
}

/**
 * Used to represent a DOM element
 * @name $Element
 * @extends $Node
 * @constructor
 * @private
 */
export function $Element(element) {
    if (element && element.__dom__) return element.__dom__;

    if (this instanceof $Element) {
        $Node.call(this, element);
    } else {
        return new $Element(element);
    }
}

$Element.prototype = new $Node();
$Element.prototype.toString = function() {
    var node = this._._node;

    return node ? node.tagName.toLowerCase() : "";
};

/**
 * Used to represent a collection of DOM elements
 * @name $Elements
 * @extends $Element
 * @constructor
 * @private
 */
export function $Elements(elements) {
    for (var i = 0, n = elements && elements.length || 0; i < n; ++i) {
        this[i] = $Element(elements[i]);
    }

    this._ = {};
    this.length = n;
}

$Elements.prototype = new $Element();
$Elements.prototype.toString = Array.prototype.join;

var DOM = new $Node(document);

DOM.version = "<%= pkg.version %>";

window.DOM = DOM;

/**
 * Global object to access DOM
 * @namespace DOM
 * @extends $Node
 */
export default DOM;
