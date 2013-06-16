define(["Node", "Element"], function(DOMNode, DOMElement, _slice, _makeError) {
    "use strict";

    /**
     * Prepend extra arguments to the method with specified name
     * @param  {String}    name  name of method to bind arguments with
     * @param  {...Object} args  extra arguments to prepend to the method
     * @return {DOMElement}
     */
    DOMElement.prototype.bind = function(name) {
        var args = _slice(arguments, 1),
            method = this[name];

        if (!args.length || typeof method !== "function" || method in DOMNode.prototype || method in DOMElement.prototype) {
            throw _makeError("bind", this);
        }

        this[name] = function() {
            return method.apply(this, args.concat(_slice(arguments)));
        };

        return this;
    };
});
