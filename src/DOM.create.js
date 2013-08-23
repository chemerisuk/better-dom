define(["DOM", "Element"], function(DOM, $Element, _makeError) {
    "use strict";

    // CREATE ELEMENT
    // --------------

    (function(){
        var rquick = /^[a-z]+$/;

        /**
         * Create a $Element instance
         * @memberOf DOM
         * @param  {Element|String} value        element/tag name or emmet expression
         * @param  {Object}         [attributes] key/value pairs of the element attributes
         * @param  {Object}         [styles]     key/value pairs of the element styles
         * @return {$Element} element
         */
        DOM.create = function(value, attributes, styles) {
            if (typeof value === "string") {
                if (value.match(rquick)) {
                    value = new $Element(document.createElement(value));

                    if (attributes && typeof attributes === "object") value.set(attributes);
                    if (styles && typeof styles === "object") value.setStyle(styles);

                    return value;
                } else {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    var sandbox = document.createElement("div");

                    sandbox.innerHTML = value;

                    if (sandbox.childNodes.length === 1 && sandbox.firstChild.nodeType === 1) {
                        value = sandbox.removeChild(sandbox.firstChild);
                    } else {
                        value = sandbox; // result will be wrapped with the div
                    }
                }
            }

            if (value.nodeType !== 1) {
                throw _makeError("create", this);
            }

            return $Element(value);
        };
    })();
});
