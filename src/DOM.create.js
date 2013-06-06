define(["DOM", "Element"], function(DOM, DOMElement, _createElement, _parseFragment) {
    "use strict";

    (function(){
        var rquick = /^[a-z]+$/;

        /**
         * Create a DOMElement instance
         * @memberOf DOM
         * @param  {String|Element} value native element or element tag name
         * @return {DOMElement} element
         */
        DOM.create = function(value) {
            if (typeof value === "string") {
                if (value.match(rquick)) {
                    value = _createElement(value);
                } else {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    value = _parseFragment(value);
                }
            }

            var nodeType = value.nodeType;

            if (nodeType === 11) {
                if (value.childNodes.length === 1) {
                    value = value.firstChild;
                } else {
                    var div = _createElement("div");

                    div.appendChild(value);

                    value = div;
                }
            } else if (nodeType !== 1) {
                this.error("create");
            }

            return DOMElement(value);
        };
    })();
});