define(["Node"], function(DOMNode, _forOwn) {
    "use strict";

    (function() {
        var processObjectParam = function(value, name) { this.setData(name, value); };

        /**
         * Read data entry value
         * @memberOf DOMNode.prototype
         * @param  {String} key data entry key
         * @return {Object} data entry value
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.setData("test", "message");
         * domLink.getData("test");
         * // returns string "message"
         */
        DOMNode.prototype.getData = function(key) {
            if (typeof key !== "string") {
                throw this.makeError("getData");
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
         * @memberOf DOMNode.prototype
         * @param {String|Object} key data entry key | key/value pairs
         * @param {Object} value data to store
         * @example
         * var domLink = DOM.find(".link");
         *
         * domLink.setData("test", "message");
         * domLink.setData({a: "b", c: "d"});
         */
        DOMNode.prototype.setData = function(key, value) {
            var keyType = typeof key;

            if (keyType === "string") {
                this._data[key] = value;
            } else if (keyType === "object") {
                _forOwn(key, processObjectParam, this);
            } else {
                throw this.makeError("setData");
            }

            return this;
        };
    })();
});