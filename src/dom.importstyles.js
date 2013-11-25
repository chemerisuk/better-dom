var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    styleNode = document.documentElement.firstChild.appendChild(document.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet,
    styleRules = styleSheet.cssRules || styleSheet.rules,
    args = DOM.importStyles.args;

/**
 * Append global css styles
 * @memberOf DOM
 * @param {String|Object} selector css selector or object with selector/rules pairs
 * @param {String}        cssText  css rules
 */
DOM.importStyles = function(selector, cssText, /*INTENAL*/unique) {
    if (cssText && typeof cssText === "object") {
        var styleObj = {};
        // make a temporary element to populate styleObj
        // with values that could be insterted into document
        new $Element({style: styleObj}).style(cssText);

        cssText = [];

        _.forOwn(styleObj, function(styles, selector) {
            cssText.push(selector + ":" + styles);
        });

        cssText = cssText.join(";");
    }

    if (typeof selector !== "string" || typeof cssText !== "string") {
        throw _.makeError("importStyles", this);
    }

    // check if the rule already exists
    if (!unique || !_.some(styleRules, function(rule) {
        var selText = (rule.selectorText || "").replace("::", ":");
        // normalize pseudoelement selectors and ignore quotes
        return selText === selector || selText === selector.split("\"").join("'");
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

// populate existing calls
_.forEach(args, function(args) { DOM.importStyles.apply(DOM, args) });
