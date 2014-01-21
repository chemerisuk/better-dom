var _ = require("./utils");

/**
 * Used to represent a DOM node
 * @name $Node
 * @constructor
 * @private
 */
function $Node(node) {
    if (node) {
        this[_.NODE] = node;
        this[_.DATA] = {};
        this[_.HANDLERS] = [];

        this[0] = node.__dom__ = this;
    }

    this.length = node ? 1 : 0;
}

/**
 * Get property value by name
 * @param  {String} name property name
 * @return {String} property value
 */
$Node.prototype.get = function(name) {
    return this[_.NODE][name];
};

/**
 * Set property value by name
 * @param  {String} name  property name
 * @param  {String} value property value
 */
$Node.prototype.set = function(name, value) {
    this[_.NODE][name] = value;

    return this;
};

module.exports = $Node;
