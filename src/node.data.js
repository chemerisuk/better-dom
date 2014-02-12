var _ = require("./utils"),
    /**
     * Data property support
     * @exports data
     * @see https://github.com/chemerisuk/better-dom/wiki/Data-property
     */
    $Node = require("./node");

/**
 * Getter/setter of a data entry value. Tries to read the appropriate
 * HTML5 data-* attribute if it exists
 * @param  {String|Object|Array}  key(s)  data key or key/value object or array of keys
 * @param  {Object}               [value] data value to store
 * @return {Object} data entry value or this in case of setter
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

                if (value === undefined) {
                    try {
                        value = node.getAttribute("data-" + key);
                        // parse object notation syntax
                        if (value[0] === "{" && value[value.length - 1] === "}") {
                            value = JSON.parse(value);
                        }
                    } catch (err) {}

                    data[key] = value;
                }
            }

            return value;
        } else if (key && keyType === "object") {
            if (Array.isArray(key)) {
                return key.reduce(function(r, key) { return r[key] = data[key], r; }, {});
            } else {
                return this.each(function(el) { _.extend(el._data, key) });
            }
        }
    } else if (len === 2 && keyType === "string") {
        return this.each(function(el) { el._data[key] = value });
    }

    throw _.makeError("data", this);
};
