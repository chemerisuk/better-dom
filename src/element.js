var _ = require("./utils"),
    $Node = require("./node");

/**
 * Used to represent a DOM element or collection
 * @name $Element
 * @param element {Object} native element(s)
 * @extends $Node
 * @constructor
 * @private
 */
function $Element(element, /*INTERNAL*/collection) {
    if (element && element.__dom__) return element.__dom__;

    if (!(this instanceof $Element)) return new $Element(element, collection);

    if (element && collection === true) {
        Array.prototype.push.apply(this, _.map(element, $Element));
        // negative index support
        for (var i = 1, n = this.length; i <= n; ++i) this[-i] = this[n - i];
    } else {
        $Node.call(this, element);
    }
}

$Element.prototype = new $Node();

module.exports = $Element;
