define(["Element"], function(DOMElement, _makeError) {
    "use strict";

    // GETTER
    // ------

    (function() {
        var hooks = {};

        /**
         * Get property or attribute by name
         * @param  {String} [name] property/attribute name
         * @return {String} property/attribute value
         */
        DOMElement.prototype.get = function(name) {
            var el = this._node,
                hook = hooks[name];

            if (name === undefined) {
                name = el.type && "value" in el ? "value" : "innerHTML";
            } else if (typeof name !== "string") {
                throw _makeError("get", this);
            }

            return hook ? hook(el) : (name in el ? el[name] : el.getAttribute(name));
        };

        hooks.tagName = hooks.nodeName = function(el) {
            return el.nodeName.toLowerCase();
        };
    })();
});
