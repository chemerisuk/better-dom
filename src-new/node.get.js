var _ = require("utils"),
    $Node = require("node");
/**
 * Get property by name
 * @param  {String} name property name
 * @return {String} property value
 */
$Node.prototype.get = function(name) {
    if (typeof name !== "string") throw _.makeError(this, "get");

    return this._node[name];
};
