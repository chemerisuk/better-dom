define(["Node"], function($Node, _extend, _forEach, _makeError) {
    "use strict";

    // INTERNAL DATA
    // -------------

    /**
     * Getter/setter of a data entry value. Tries to read the appropriate
     * HTML5 data-* attribute if it exists
     * @param  {String|Object} key     data key
     * @param  {Object}        [value] data value to store
     * @return {Object} data entry value or this in case of setter
     * @see https://github.com/chemerisuk/better-dom/wiki/Data-property
     */
    $Node.prototype.data = function(key, value) {
        var len = arguments.length,
            keyType = typeof key,
            node = this._node,
            data = this._data;

        if (len === 1) {
            if (keyType === "string") {
                if (node) {
                    value = data[key];

                    if (value === undefined && node.hasAttribute("data-" + key)) {
                        value = data[key] = node.getAttribute("data-" + key);
                    }
                }

                return value;
            } else if (key && keyType === "object") {
                return _forEach(this, function(el) {
                    _extend(el._data, key);
                });
            }
        } else if (len === 2 && keyType === "string") {
            return _forEach(this, function(el) {
                el._data[key] = value;
            });
        }

        throw _makeError("data", this);
    };
});
