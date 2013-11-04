var _ = require("./utils"),
    $Node = require("./node");
/**
 * Set property value
 * @param  {String} name  property name
 * @param  {String} value property value
 */
$Node.prototype.set = function(name, value) {
    if (typeof name !== "string" || typeof value !== "string") throw _.makeError(this, "set");

    this._node[name] = value;

    return this;
};
