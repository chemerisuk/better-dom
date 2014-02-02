/**
 * Used to represent a DOM node
 * @name $Node
 * @constructor
 * @private
 */
function $Node(node) {
    if (node) {
        this._node = node;
        this._data = {};
        this._handlers = [];

        this[0] = node.__dom__ = this;
    }

    this.length = node ? 1 : 0;
}

/**
 * Get property value by name
 * @param  {String} name property name
 * @return {Object} property value
 */
$Node.prototype.get = function(name) {
    return this._node[name];
};

/**
 * Set property value by name
 * @param  {String} name  property name
 * @param  {Object} value property value
 * @return {$Node}
 */
$Node.prototype.set = function(name, value) {
    this._node[name] = value;

    return this;
};

module.exports = $Node;
