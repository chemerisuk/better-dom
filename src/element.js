var _ = require("./utils"),
    $Node = require("./node");

/**
 * Used to represent a DOM element or collection
 * @name $Element
 * @extends $Node
 * @constructor
 * @private
 */
function $Element(element, collection) {
    if (element && element.__dom__) return element.__dom__;

    if (!(this instanceof $Element)) return new $Element(element, collection);

    if (element && collection === true) {
        Array.prototype.push.apply(this, _.map(element, $Element));
    } else {
        $Node.call(this, element);
    }
}

$Element.prototype = new $Node();

module.exports = $Element;
