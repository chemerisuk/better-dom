var _ = require("./utils"),
    $Element = require("./element");

/**
 * Used to represent a collection of DOM elements
 * @name $Elements
 * @extends $Element
 * @constructor
 * @private
 */
function $Elements(elements) {
    _.push.apply(this, _.map.call(elements, $Element));
}

$Elements.prototype = new $Element();
$Elements.prototype.toString = Array.prototype.join;

module.exports = $Elements;
