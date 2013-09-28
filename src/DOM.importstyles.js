define(["DOM", "Element"], function(DOM, $Element, _forEach, _makeError, documentElement) {
    "use strict";

    // IMPORT STYLES
    // -------------

    (function() {
        var styleNode = documentElement.firstChild.appendChild(document.createElement("style")),
            styleSheet = styleNode.sheet || styleNode.styleSheet;

        /**
         * Append global css styles
         * @memberOf DOM
         * @param {String|Object} selector css selector or object with selector/rules pairs
         * @param {String} styles css rules
         */
        DOM.importStyles = function(selector, styles) {
            if (typeof styles === "object") {
                var obj = {_node: {style: {cssText: ""}}};

                $Element.prototype.css.call(obj, styles);

                styles = obj._node.style.cssText.substr(1); // remove leading comma
            }

            if (typeof selector !== "string" || typeof styles !== "string") {
                throw _makeError("importStyles", this);
            }

            if (styleSheet.cssRules) {
                styleSheet.insertRule(selector + " {" + styles + "}", styleSheet.cssRules.length);
            } else {
                // ie doesn't support multiple selectors in addRule
                _forEach(selector.split(","), function(selector) {
                    styleSheet.addRule(selector, styles);
                });
            }

            return this;
        };

        DOM.importStyles("[aria-hidden=true]", "display:none");
    }());
});
