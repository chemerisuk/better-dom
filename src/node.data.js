import _ from "./utils";
import $Node from "./node";

/**
 * Getter/setter of a data entry value. Tries to read the appropriate
 * HTML5 data-* attribute if it exists
 * @param  {String|Object|Array}  key(s)  data key or key/value object or array of keys
 * @param  {Object}               [value] data value to store
 * @return {Object} data entry value or this in case of setter
 * @deprecated see {@link https://github.com/chemerisuk/better-dom/issues/12}
 */
$Node.prototype.data = function(key, value) {
    var len = arguments.length,
        keyType = typeof key;

    if (len === 1) {
        if (keyType === "string") {
            return this.get("_" + key);
        } else if (key && keyType === "object") {
            if (Array.isArray(key)) {
                return this.get(key.map((key) => "_" + key ));
            } else {
                return _.forOwn(key, (value, key) => { this.set("_" + key, value) });
            }
        }
    } else if (len === 2) {
        return this.each((el) => { el.set("_" + key, value) });
    }

    throw _.makeError("data", this);
};
