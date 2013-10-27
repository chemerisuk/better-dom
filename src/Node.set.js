define(["Node"], function($Node, _makeError) {
    "use strict";

    /**
     * Set property value
     * @param  {String} name property name
     * @param {String} property value
     */
    $Node.prototype.set = function(name, value) {
        if (typeof name !== "string" || typeof value !== "string") throw _makeError(this, "set");

        this._node[name] = value;

        return this;
    };
});
