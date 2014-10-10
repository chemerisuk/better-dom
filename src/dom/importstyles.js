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
    appendCSS = (cssText, cssMap) => (selector) => {
        var props = cssText || cssMap[selector];

        try {
            if (styleSheet.cssRules) {
                styleSheet.insertRule(selector + "{" + props + "}", styleRules.length);
            } else {
                styleSheet.addRule(selector, props);
            }
        } catch(err) {
            // silently ignore invalid rules
        }
    };

/**
 * Append global css styles
 * @memberof DOM
 * @alias DOM.importStyles
 * @param {String|Object}  selector  css selector or key-value map of rules
 * @param {String|Object}  cssText   css rules
 * @example
 * DOM.importStyles(".foo", {color: "red", padding: 5});
 * // you can use strings CSS too
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
    } else if (selector && typeof selector === "object") {
        _.keys(selector).forEach(appendCSS(null, selector));
    } else {
        throw new StaticMethodError("importStyles", arguments);
    }
};

export default DOM.importStyles;
