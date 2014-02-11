var _ = require("./utils"),
    $Element = require("./element"),
    push = Array.prototype.push;

/**
 * Used to represent a collection of DOM elements
 * @name $Elements
 * @extends $Element
 * @constructor
 * @private
 */
function $Elements(elements) {
    push.apply(this, _.map(elements, $Element));
}

$Elements.prototype = new $Element();

module.exports = $Elements;
