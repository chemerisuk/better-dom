import { $Document } from "../document/index";
import { injectElement } from "../util/index";
import { DocumentTypeError } from "../errors";

const PROP_NAME = "<%= prop() %>styles";

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
$Document.prototype.importStyles = function(selector, cssText) {
    const node = this[0];

    if (!node) return;

    var styleSheet = node[PROP_NAME];

    if (!styleSheet) {
        const styleNode = injectElement(node.createElement("style"));
        styleSheet = styleNode.sheet || styleNode.styleSheet;
        // store object internally
        node[PROP_NAME] = styleSheet;
    }

    if (!cssText && typeof selector === "string") {
        cssText = selector;
        selector = "@media screen";
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw new DocumentTypeError("importStyles", arguments);
    }

    var lastIndex = styleSheet.cssRules.length;
    // insert rules one by one: if one selector fails
    // it should not break other rules
    selector.split(",").forEach((selector) => {
        try {
            lastIndex = styleSheet.insertRule(selector + "{" + cssText + "}", lastIndex);
        } catch(err) {
            // silently ignore invalid rules
        }
    });
};
