define(["Node"], function(DOMNode, _slice) {
    "use strict";

    /**
     * Bind a method with specified arguments
     * @param {String} name name of method to bind arguments with
     * @return {[type]} [description]
     */
    DOMNode.prototype.bind = function(name) {
        var args = _slice(arguments, 1),
            method = this[name];

        if (!args.length || typeof method !== "function") {
            throw this.makeError("bind");
        }

        this[name] = function() {
            return method.apply(this, args.concat(_slice(arguments)));
        };

        return this;
    };
});
