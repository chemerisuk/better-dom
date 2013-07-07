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
            var node = this._node,
                hook = hooks[name];

            if (name === undefined) {
                if (node.tagName === "OPTION") {
                    name = node.hasAttribute("value") ? "value" : "text";
                } else {
                    name = node.type && "value" in node ? "value" : "innerHTML";
                }
            } else if (typeof name !== "string") {
                throw _makeError("get", this);
            }

            return hook ? hook(node, name) : (name in node ? node[name] : node.getAttribute(name));
        };

        hooks.tagName = hooks.method = function(node, key) {
            return node[key].toLowerCase();
        };

        hooks.elements = hooks.options = function(node, key) {
            return new $CompositeElement(node[key]);
        };

        hooks.form = function(node) {
            return $Element(node.form);
        };

        hooks.type = function(node) {
            // some browsers don't recognize input[type=email] etc.
            return node.getAttribute("type") || node.type;
        };
    })();
});
