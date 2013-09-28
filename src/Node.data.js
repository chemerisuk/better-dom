define(["Node"], function($Node, _extend, _makeError) {
    "use strict";

    // INTERNAL DATA
    // -------------

    /**
     * Getter/setter of a data entry value. Tries to read the appropriate
     * HTML5 data-* attribute if it exists
     * @param  {String|Object} key     data key
     * @param  {Object}        [value] data value to store
     * @return {Object} data entry value or this in case of setter
     * @example
     * el.data("test", "message");
     * el.data("test"); // => "message"
     */
    $Node.prototype.data = function(key, value) {
        var len = arguments.length,
            node = this._node,
            data = this._data,
            keyType = typeof key;

        if (len === 1) {
            if (keyType === "string") {
                value = data[key];

                if (value === undefined && node.hasAttribute("data-" + key)) {
                    value = data[key] = node.getAttribute("data-" + key);
                }

                return value;
            } else if (key && keyType === "object") {
                _extend(data, key);

                return this;
            }
        } else if (len === 2 && keyType === "string") {
            data[key] = value;

            return this;
        }

        throw _makeError("data", this);
    };
});
