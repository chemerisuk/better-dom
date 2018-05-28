import { SHEET_PROP_NAME } from "../const";
import { DocumentTypeError } from "../errors";
import { $Document } from "../document/index";

/**
 * Append global css styles
 * @param {String}  selector  css selector
 * @param {String}  cssText   css rules
 * @example
 * DOM.importStyles(".foo, .bar", "background: white; color: gray");
 * // more complex selectors
 * DOM.importStyles("@keyframes fade", "from {opacity: 0.99} to {opacity: 1}");
 */
$Document.prototype.importStyles = function(selector, cssText) {
    const node = this[0];

    if (!node) return;

    if (!cssText && typeof selector === "string") {
        cssText = selector;
        selector = "@media screen";
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw new DocumentTypeError("importStyles", arguments);
    }

    const styleSheet = node[SHEET_PROP_NAME];
    var lastIndex = styleSheet.cssRules.length;
    // insert rules one by one:
    // failed selector does not break others
    selector.split(",").forEach((selector) => {
        try {
            lastIndex = styleSheet.insertRule(selector + "{" + cssText + "}", lastIndex);
        } catch(err) {
            // silently ignore invalid rules
        }
    });
};
