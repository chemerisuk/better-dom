var _ = require("./utils"),
    DOM = require("./dom"),
    styleAccessor = require("./styleaccessor"),
    styleNode = _.injectElement(document.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet,
    styleRules = styleSheet.cssRules || styleSheet.rules,
    // normalize pseudoelement selectors or quotes
    norm = _.DOM2_EVENTS ? ["::", ":"] : ["\"", "'"];

/**
 * Append global css styles
 * @memberOf DOM
 * @param {String}         selector  css selector
 * @param {String|Object}  cssText   css rules
 */
DOM.importStyles = function(selector, cssText, /*INTENAL*/unique) {
    if (cssText && typeof cssText === "object") {
        var styleObj = {};

        _.forOwn(cssText, function(value, prop) {
            var hook = styleAccessor.set[prop];

            value = typeof value === "number" ? value + "px" : value || "";

            if (hook) {
                hook(styleObj, value);
            } else {
                styleObj[prop] = value;
            }
        });

        cssText = [];

        _.forOwn(styleObj, function(styles, selector) {
            cssText.push(selector + ":" + styles);
        });

        cssText = cssText.join(";");
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw _.makeError("importStyles", true);
    }

    // check if the rule already exists
    if (!unique || !_.some(styleRules, function(rule) {
        return selector === (rule.selectorText || "").split(norm[0]).join(norm[1]);
    })) {
        if (styleSheet.cssRules) {
            styleSheet.insertRule(selector + " {" + cssText + "}", styleRules.length);
        } else {
            // ie doesn't support multiple selectors in addRule
            _.forEach(selector.split(","), function(selector) {
                styleSheet.addRule(selector, cssText);
            });
        }
    }
};

module.exports = DOM.importStyles;
