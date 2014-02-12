var $Element = require("./element"),
    push = Array.prototype.push,
    map = Array.prototype.map;

/**
 * Used to represent a collection of DOM elements
 * @name $Elements
 * @extends $Element
 * @constructor
 * @private
 */
function $Elements(elements) {
    push.apply(this, map.call(elements, $Element));
}

$Elements.prototype = new $Element();
$Elements.prototype.toString = Array.prototype.join;

module.exports = $Elements;
