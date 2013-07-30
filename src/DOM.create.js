define(["DOM", "Element"], function(DOM, $Element, _parseFragment, _makeError) {
    "use strict";

    // CREATE ELEMENT
    // --------------

    (function(){
        var rquick = /^[a-z]+$/;

        /**
         * Create a $Element instance
         * @memberOf DOM
         * @param  {String} value element tag name or emmet expression
         * @return {$Element} element
         */
        DOM.create = function(value) {
            if (typeof value !== "string") {
                throw _makeError("create");
            }

            if (value.match(rquick)) {
                value = document.createElement(value);
            } else {
                if (value[0] !== "<") value = DOM.parseTemplate(value);

                value = _parseFragment(value);

                if (value.childNodes.length === 1) {
                    value = value.firstChild;
                } else {
                    // wrap result with div
                    var div = document.createElement("div");
                    div.appendChild(value);
                    value = div;
                }
            }

            return new $Element(value);
        };
    })();
});
