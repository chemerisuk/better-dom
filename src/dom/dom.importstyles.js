import _ from "../util/index";
import { StaticMethodError } from "../errors";
import { DOCUMENT } from "../constants";
import { DOM } from "../types";
import CSS from "../util/css";

var styleNode = _.injectElement(DOCUMENT.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet,
    styleRules = styleSheet.cssRules || styleSheet.rules;

/**
 * Append global css styles
 * @memberof DOM
 * @alias DOM.importStyles
 * @param {String}         selector  css selector
 * @param {String|Object}  cssText   css rules
 */
DOM.importStyles = function(selector, cssText) {
    if (cssText && typeof cssText === "object") {
        // use styleObj to collect all style props for a new CSS rule
        var styleObj = Object.keys(cssText).reduce((styleObj, prop) => {
            var hook = CSS.set[prop];

            if (hook) {
                hook(styleObj, cssText[prop]);
            } else {
                styleObj[prop] = cssText[prop];
            }

            return styleObj;
        }, {});

        cssText = Object.keys(styleObj).map((key) => key + ":" + styleObj[key]).join(";");
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw new StaticMethodError("importStyles");
    }

    if (styleSheet.cssRules) {
        styleSheet.insertRule(selector + "{" + cssText + "}", styleRules.length);
    } else {
        // ie doesn't support multiple selectors in addRule
        selector.split(",").forEach((selector) => { styleSheet.addRule(selector, cssText) });
    }
};
