define(["DOM", "Element"], function(DOM, DOMElement, createElement, parseFragment, makeError) {
    "use strict";

    /**
     * Create a DOMElement instance
     * @memberOf DOM
     * @param  {String|Element} value native element or element tag name
     * @return {DOMElement} element
     */
    DOM.create = (function(){
        var rquick = /^[a-z]+$/;

        return function(value) {
            if (typeof value === "string") {
                if (value.match(rquick)) {
                    value = createElement(value);
                } else {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    value = parseFragment(value);
                }
            }

            var nodeType = value.nodeType;

            if (nodeType === 11) {
                if (value.childNodes.length === 1) {
                    value = value.firstChild;
                } else {
                    var div = createElement("div");

                    div.appendChild(value);

                    value = div;
                }
            } else if (nodeType !== 1) {
                throw makeError("create", "DOM");
            }

            return DOMElement(value);
        };
    })();
});