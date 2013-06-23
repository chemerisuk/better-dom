define(["Element"], function(DOMElement, _makeError) {
    "use strict";

    /**
     * Check if the element has specific property/attribute
     * @param  {String} name property/attribute name
     * @return {Boolean} true, if property/attribute exists
     */
    DOMElement.prototype.has = function(name) {
        if (typeof name !== "string") {
            throw _makeError("has", this);
        }

        var el = this._node;

        return !!el[name] || el.hasAttribute(name);
    };
});
