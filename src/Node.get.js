define(["Node"], function($Node, _makeError) {
    "use strict";

    /**
     * Get property by name
     * @param  {String} name property name
     * @return {String} property value
     */
    $Node.prototype.get = function(name) {
        if (typeof name !== "string") throw _makeError(this, "get");

        return this._node[name];
    };
});
