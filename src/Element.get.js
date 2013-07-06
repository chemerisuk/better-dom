define(["Element"], function($Element, $CompositeElement, _makeError) {
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
        $Element.prototype.get = function(name) {
            var el = this._node,
                hook = hooks[name];

            if (name === undefined) {
                if (el.tagName === "OPTION") {
                    name = el.hasAttribute("value") ? "value" : "text";
                } else {
                    name = el.type && "value" in el ? "value" : "innerHTML";
                }
            } else if (typeof name !== "string") {
                throw _makeError("get", this);
            }

            return hook ? hook(el) : (name in el ? el[name] : el.getAttribute(name));
        };

        hooks.tagName = function(el) {
            return el.nodeName.toLowerCase();
        };

        hooks.elements = function(el) {
            return new $CompositeElement(el.elements);
        };

        hooks.options = function(el) {
            return new $CompositeElement(el.options);
        };

        hooks.form = function(el) {
            return $Element(el.form);
        };

        hooks.type = function(el) {
            // some browsers don't recognize input[type=email] etc.
            return el.getAttribute("type") || el.type;
        };

        hooks.method = function(el) {
            return el.method.toLowerCase();
        };
    })();
});
