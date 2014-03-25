import $Node from "./node";

/**
 * Used to represent a DOM element
 * @name $Element
 * @extends $Node
 * @constructor
 * @private
 */
function $Element(element) {
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

export default $Element;
