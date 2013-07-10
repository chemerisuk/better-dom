define(["DOM", "Element"], function(DOM, $Element, _parseFragment) {
    "use strict";

    // CREATE ELEMENT
    // --------------

    (function(){
        var rquick = /^[a-z]+$/;

        /**
         * Create a $Element instance
         * @memberOf DOM
         * @param  {String|Element} value native element or element tag name
         * @return {$Element} element
         */
        DOM.create = function(value) {
            if (typeof value === "string") {
                if (value.match(rquick)) {
                    value = document.createElement(value);
                } else {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    value = _parseFragment(value);
                }
            }

            var nodeType = value.nodeType, div;

            if (nodeType === 11) {
                if (value.childNodes.length === 1) {
                    value = value.firstChild;
                } else {
                    // wrap result with div
                    div = document.createElement("div");
                    div.appendChild(value);
                    value = div;
                }
            } else if (nodeType !== 1) {
                this.error("create");
            }

            return $Element(value);
        };
    })();
});
