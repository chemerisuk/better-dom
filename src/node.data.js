var _ = require("./utils"),
    $Node = require("./node");

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

                if (value === undefined) {
                    try {
                        value = node.getAttribute("data-" + key);
                        value = JSON.parse("{\"" + value.split(";").join("\",\"").split("=").join("\":\"") + "\"}");
                    } catch (err) {}

                    data[key] = value;
                }
            }

            return value;
        } else if (key && keyType === "object") {
            return _.forEach(this, function(el) { _.extend(el._data, key) });
        }
    } else if (len === 2 && keyType === "string") {
        return _.forEach(this, function(el) { el._data[key] = value });
    }

    throw _.makeError("data", this);
};
