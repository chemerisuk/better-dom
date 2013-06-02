define(["DOM", "Element"], function(DOM, DOMElement, createElement, makeError, supports) {
    "use strict";

    (function() {
        var styleSheet = (function() {
                var headEl = document.scripts[0].parentNode;

                headEl.insertBefore(createElement("style"), headEl.firstChild);

                return document.styleSheets[0];
            })(),
            obj = {_node: {style: {cssText: ""}}};

        /**
         * Import global css styles on page
         * @memberOf DOM
         * @param {String|Object} selector css selector or object with selector/rules pairs
         * @param {String} styles css rules
         * @function
         */
        DOM.importStyles = function(selector, styles) {
            if (typeof styles === "object") {
                DOMElement.prototype.setStyle.call(obj, styles);

                styles = obj._node.style.cssText.substr(1); // remove leading comma
            }

            if (typeof selector !== "string" || typeof styles !== "string") {
                throw makeError("importStyles", "DOM");
            }

            if (styleSheet.cssRules) {
                // w3c browser
                styleSheet.insertRule(selector + " {" + styles + "}", styleSheet.cssRules.length);
            } else {
                // ie doesn't support multiple selectors in addRule
                _.forEach(selector.split(","), function(selector) {
                    styleSheet.addRule(selector, styles);
                });
            }
        };

        if (!supports("hidden", "a")) {
            // corrects block display not defined in IE8/9
            DOM.importStyles("article,aside,figcaption,figure,footer,header,hgroup,main,nav,section", "display:block");
            // adds styling not present in IE6/7/8/9
            DOM.importStyles("mark", "background:#FF0;color:#000");
            // hides non-rendered elements
            DOM.importStyles("template,[hidden]", "display:none");
        }
    })();
});