var $Node = require("./node");

/**
 * Set property value by name
 * @param  {String} name  property name
 * @param  {String} value property value
 */
$Node.prototype.set = function(name, value) {
    this._node[name] = value;

    return this;
};
