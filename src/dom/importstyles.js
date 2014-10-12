import _ from "../util/index";
import { StaticMethodError } from "../errors";
import { DOCUMENT } from "../const";
import { DOM } from "../types";
import HOOK from "../util/stylehooks";

var styleNode = _.injectElement(DOCUMENT.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet,
    styleRules = styleSheet.cssRules || styleSheet.rules,
    toString = (cssText) => {
        // use styleObj to collect all style props for a new CSS rule
        var styleObj = _.keys(cssText).reduce((styleObj, prop) => {
            var hook = HOOK.set[prop];

            if (hook) {
                hook(styleObj, cssText[prop]);
            } else {
                styleObj[prop] = cssText[prop];
            }

            return styleObj;
        }, {});

        return _.keys(styleObj).map((key) => key + ":" + styleObj[key]).join(";");
    },
    appendCSS = (cssText) => (selector) => {
        try {
            /* istanbul ignore else */
            if (styleSheet.cssRules) {
                styleSheet.insertRule(selector + "{" + cssText + "}", styleRules.length);
            } else {
                styleSheet.addRule(selector, cssText);
            }
        } catch(err) {
            // silently ignore invalid rules
        }
    };

/**
 * Append global css styles
 * @memberof DOM
 * @alias DOM.importStyles
 * @param {String}         selector  css selector
 * @param {String|Object}  cssText   css rules
 * @example
 * DOM.importStyles(".foo", {color: "red", padding: 5});
 * // you can use CSS strings too
 * DOM.importStyles(".bar", "background: white; color: gray");
 */
DOM.importStyles = function(selector, cssText) {
    if (cssText && typeof cssText === "object") {
        cssText = toString(cssText);
    }

    if (typeof selector === "string" && typeof cssText === "string") {
        // insert rules one by one because of several reasons:
        // 1. IE8 does not support comma in a selector string
        // 2. if one selector fails it doesn't break others
        selector.split(",").forEach(appendCSS(cssText));
    } else {
        throw new StaticMethodError("importStyles", arguments);
    }
};
