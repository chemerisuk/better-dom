define(["Node"], function(DOMNode, supports) {
    "use strict";

    (function() {
        var cache = {};
        /**
         * Check element capability
         * @memberOf DOMNode.prototype
         * @param {String} prop property to check
         * @param {String} [tag] name of element to test
         * @function
         * @example
         * input.supports("placeholder");
         * // => true if an input supports placeholders
         * DOM.supports("addEventListener");
         * // => true if browser supports document.addEventListener
         * DOM.supports("oninvalid", "input");
         * // => true if browser supports `invalid` event
         */
        DOMNode.prototype.supports = function(prop, tag) {
            var key = prop + ":" + (tag || this._node.nodeName.toLowerCase());

            return cache[key] || ( cache[key] = supports(prop, tag || this._node) );
        };
    })();
});