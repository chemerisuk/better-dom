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
         * @example
         * // returns value of the id property (i.e. "link" string)
         * link.get("id");
         * // returns value of "data-attr" attribute
         * link.get("data-attr");
         * // returns innerHTML of the element
         * link.get();
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
