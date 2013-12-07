var $Node = require("./node");

/**
 * Get property value by name
 * @param  {String} name property name
 * @return {String} property value
 */
$Node.prototype.get = function(name) {
    return this._node[name];
};
