define(["DOM", "Element"], function(DOM, DOMElement, _createElement, _forEach, _makeError) {
    "use strict";

    // IMPORT STYLES
    // -------------

    (function() {
        var styleSheet = (function() {
                var styleEl = document.documentElement.firstChild.appendChild(_createElement("style"));

                return styleEl.sheet || styleEl.styleSheet;
            })();

        /**
         * Import global css styles on page
         * @memberOf DOM
         * @param {String|Object} selector css selector or object with selector/rules pairs
         * @param {String} styles css rules
         */
        DOM.importStyles = function(selector, styles) {
            if (typeof styles === "object") {
                var obj = {_node: {style: {cssText: ""}}};

                DOMElement.prototype.setStyle.call(obj, styles);

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
        };

        if (!DOM.supports("hidden", "a")) {
            DOM.importStyles("[hidden]", "display:none");
        }
    }());
});
