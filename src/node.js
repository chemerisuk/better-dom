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
        this._listeners = [];

        this[0] = node.__dom__ = this;
    }

    this.length = node ? 1 : 0;
}

module.exports = $Node;
