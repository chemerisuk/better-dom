var $Node = require("./node");

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
        this._visibility = ""; /* reduce number of hidden classes */

        $Node.call(this, element);
    } else {
        return new $Element(element);
    }
}

$Element.prototype = new $Node();
$Element.prototype.toString = function() {
    return this._node ? this._node.tagName.toLowerCase() : "";
};

module.exports = $Element;
