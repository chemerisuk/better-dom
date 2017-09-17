import { $NewDocument } from "../document/index";
import { injectElement } from "../util/index";
import { DocumentTypeError } from "../errors";

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
$NewDocument.prototype.importStyles = function(selector, cssText) {
    const node = this["<%= prop() %>"];

    if (!node) return;

    var styleSheet = this["<%= prop('styles') %>"];

    if (!styleSheet) {
        let styleNode = injectElement(node.createElement("style"));

        styleSheet = styleNode.sheet || styleNode.styleSheet;
        // store object internally
        this["<%= prop('styles') %>"] = styleSheet;
    }

    if (!cssText && typeof selector === "string") {
        cssText = selector;
        selector = "@media screen";
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw new DocumentTypeError("importStyles", arguments);
    }

    // insert rules one by one because of several reasons:
    // 1. IE8 does not support comma in a selector string
    // 2. if one selector fails it doesn't break others
    selector.split(",").forEach((selector) => {
        try {
            styleSheet.insertRule(selector + "{" + cssText + "}", styleSheet.cssRules.length);
        } catch(err) {
            // silently ignore invalid rules
        }
    });
};
