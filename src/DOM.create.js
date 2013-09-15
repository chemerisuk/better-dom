define(["DOM", "Element"], function(DOM, $Element, _makeError) {
    "use strict";

    // CREATE ELEMENT
    // --------------

    (function(){
        var rquick = /^[a-z]+$/;

        /**
         * Create a $Element instance
         * @memberOf DOM
         * @param  {Mixed}          value        native element or HTMLString or EmmetString
         * @param  {Object}         [attributes] key/value pairs of the element attributes
         * @param  {Object}         [styles]     key/value pairs of the element styles
         * @return {$Element} element
         */
        DOM.create = function(value, attributes, styles) {
            if (typeof value === "string") {
                if (rquick.test(value)) {
                    value = new $Element(document.createElement(value));
                } else {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    var sandbox = document.createElement("div");

                    sandbox.innerHTML = value;

                    if (sandbox.childNodes.length === 1 && sandbox.firstChild.nodeType === 1) {
                        // remove temporary element
                        sandbox = sandbox.removeChild(sandbox.firstChild);
                    }

                    value = new $Element(sandbox);
                }

                if (attributes) value.set(attributes);
                if (styles) value.setStyle(styles);

                return value;
            }

            if (value.nodeType === 1) return $Element(value);

            throw _makeError("create", this);
        };
    })();
});
