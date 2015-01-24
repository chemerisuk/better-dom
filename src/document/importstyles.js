import _ from "../util/index";
import { injectElement } from "../util/index";
import { DOM } from "../const";
import { StaticMethodError } from "../errors";

DOM.register({
    /**
     * Append global css styles
     * @memberof $Document#
     * @alias $Document#importStyles
     * @param {String}  selector  css selector
     * @param {String}  cssText   css rules
     * @example
     * DOM.importStyles(".foo, .bar", "background: white; color: gray");
     * // more complex selectors
     * DOM.importStyles("@keyframes fade", "from {opacity: 0.99} to {opacity: 1}");
     */
    importStyles(selector, cssText) {
        var styleSheet = this._["<%= prop('styles') %>"];

        if (!styleSheet) {
            let doc = this[0].ownerDocument,
                styleNode = injectElement(doc.createElement("style"));

            styleSheet = styleNode.sheet || styleNode.styleSheet;
            // store object internally
            this._["<%= prop('styles') %>"] = styleSheet;
        }

        if (typeof selector !== "string" || typeof cssText !== "string") {
            throw new StaticMethodError("importStyles", arguments);
        }

        // insert rules one by one because of several reasons:
        // 1. IE8 does not support comma in a selector string
        // 2. if one selector fails it doesn't break others
        selector.split(",").forEach((selector) => {
            try {
                /* istanbul ignore else */
                if (styleSheet.cssRules) {
                    styleSheet.insertRule(selector + "{" + cssText + "}", styleSheet.cssRules.length);
                } else if (selector[0] !== "@") {
                    styleSheet.addRule(selector, cssText);
                } else {
                    // addRule doesn't support at-rules, use cssText instead
                    styleSheet.cssText += selector + "{" + cssText + "}";
                }
            } catch(err) {
                // silently ignore invalid rules
            }
        });
    }
});
