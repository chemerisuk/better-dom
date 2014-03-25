/**
 * Used to represent a DOM node
 * @name $Node
 * @constructor
 * @private
 */
function $Node(node) {
    if (node) this[0] = node.__dom__ = this;

    this._ = {_node: node, _handlers: []};
    this.length = node ? 1 : 0;
}

export default $Node;
