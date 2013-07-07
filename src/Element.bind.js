define(["Node", "Element"], function($Node, $Element, _slice, _makeError) {
    "use strict";

    /**
     * Prepend extra arguments to the method with specified name
     * @param  {String}    name  name of method to bind arguments with
     * @param  {...Object} args  extra arguments to prepend to the method
     * @return {$Element}
     */
    $Element.prototype.bind = function(name) {
        var self = this,
            args = _slice(arguments, 1),
            method = this[name];

        if (typeof method !== "function" || method in $Node.prototype || method in $Element.prototype) {
            throw _makeError("bind", this);
        }

        this[name] = function() {
            return method.apply(self, args.concat(_slice(arguments)));
        };

        return this;
    };
});
