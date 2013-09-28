define(["Node"], function($Node, _extend, _makeError) {
    "use strict";

    // INTERNAL DATA
    // -------------

    /**
     * Getter/setter of a data entry value
     * @param  {String|Object} key     data key
     * @param  {Object}        [value] data value to store
     * @return {Object} data entry value or this in case of setter
     * @example
     * var domLink = DOM.find(".link");
     *
     * domLink.data("test", "message");
     * domLink.data("test");
     * // returns string "message"
     */
    $Node.prototype.data = function(key, value) {
        var len = arguments.length,
            node = this._node,
            keyType = typeof key;

        if (len === 1) {
            if (keyType === "string") {
                value = this._data[key];

                if (value === undefined && node.hasAttribute("data-" + key)) {
                    value = this._data[key] = node.getAttribute("data-" + key);
                }

                return value;
            } else if (key && keyType === "object") {
                _extend(this._data, key);

                return this;
            }
        } else if (len === 2 && keyType === "string") {
            this._data[key] = value;

            return this;
        }

        throw _makeError("data", this);
    };
});
