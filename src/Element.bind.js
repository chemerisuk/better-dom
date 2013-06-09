define(["Node", "Element"], function(DOMNode, DOMElement, _slice) {
    "use strict";

    /**
     * Prepend extra arguments to the method with specified name
     * @memberOf DOMElement.prototype
     * @param  {String}    name  name of method to bind arguments with
     * @param  {...Object} args  extra arguments to prepend to the method
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.bind = function(name) {
        var args = _slice(arguments, 1),
            method = this[name];

        if (!args.length || typeof method !== "function" || method in DOMNode.prototype || method in DOMElement.prototype) {
            throw this.makeError("bind");
        }

        this[name] = function() {
            return method.apply(this, args.concat(_slice(arguments)));
        };

        return this;
    };
});
