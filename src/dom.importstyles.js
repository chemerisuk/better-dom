import _ from "./util";
import DOM from "./index";
import CSS from "./util/css";

var styleNode = _.injectElement(document.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet,
    styleRules = styleSheet.cssRules || styleSheet.rules;

/**
 * Append global css styles
 * @memberOf DOM
 * @param {String}         selector  css selector
 * @param {String|Object}  cssText   css rules
 */
DOM.importStyles = function(selector, cssText) {
    if (cssText && typeof cssText === "object") {
        // use styleObj to collect all style props for a new CSS rule
        var styleObj = {};

        _.forOwn(cssText, (value, prop) => {
            var hook = CSS.set[prop];

            if (hook) {
                hook(styleObj, value);
            } else {
                styleObj[prop] = value;
            }
        });

        cssText = [];

        _.forOwn(styleObj, (styles, selector) => { cssText.push(selector + ":" + styles) });

        cssText = cssText.join(";");
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw _.makeError("importStyles", true);
    }

    if (styleSheet.cssRules) {
        styleSheet.insertRule(selector + " {" + cssText + "}", styleRules.length);
    } else {
        // ie doesn't support multiple selectors in addRule
        selector.split(",").forEach((selector) => { styleSheet.addRule(selector, cssText) });
    }
};
