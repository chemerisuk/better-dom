define(["Node"], function($Node, _forOwn, _makeError) {
    "use strict";

    // INTERNAL DATA
    // -------------

    (function() {
        var processObjectParam = function(value, name) { this.setData(name, value); };

        /**
         * Read data entry value
         * @param  {String} key data entry key
         * @return {Object} data entry value
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.setData("test", "message");
         * domLink.getData("test");
         * // returns string "message"
         */
        $Node.prototype.getData = function(key) {
            if (typeof key !== "string") {
                throw _makeError("getData", this);
            }

            var node = this._node,
                result = this._data[key];

            if (result === undefined && node.hasAttribute("data-" + key)) {
                result = this._data[key] = node.getAttribute("data-" + key);
            }

            return result;
        };

        /**
         * Store data entry value(s)
         * @param {String|Object} key data entry key | key/value pairs
         * @param {Object} value data to store
         * @return {$Node}
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.setData("test", "message");
         * domLink.setData({a: "b", c: "d"});
         */
        $Node.prototype.setData = function(key, value) {
            var keyType = typeof key;

            if (keyType === "string") {
                this._data[key] = value;
            } else if (keyType === "object") {
                _forOwn(key, processObjectParam, this);
            } else {
                throw _makeError("setData", this);
            }

            return this;
        };
    })();
});
