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
DOM.importStyles = function(selector, cssText, /*INTENAL*/ unique) {
    if (typeof cssText === "object") {
        var obj = new $Element({style: {"__dom__": true}});

        $Element.prototype.style.call(obj, cssText);

        cssText = "";

        _.forOwn(obj._node.style, function(value, key) {
            cssText += ";" + key + ":" + value;
        });

        cssText = cssText.substr(2);
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
            styleSheet.insertRule(selector + " {" + cssText + "}", styleSheet.cssRules.length);
        } else {
            // ie doesn't support multiple selectors in addRule
            _.forEach(selector.split(","), function(selector) {
                styleSheet.addRule(selector, cssText);
            });
        }
    }

    return this;
};

// populate existing calls
_.forEach(args, function(args) { DOM.importStyles.apply(DOM, args) });
