var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    styleNode = document.documentElement.firstChild.appendChild(document.createElement("style")),
    styleSheet = styleNode.sheet || styleNode.styleSheet,
    args = DOM.importStyles.args;

/**
 * Append global css styles
 * @memberOf DOM
 * @param {String|Object} selector css selector or object with selector/rules pairs
 * @param {String} styles css rules
 */
DOM.importStyles = function(selector, styles) {
    if (typeof styles === "object") {
        var obj = new $Element({style: {"__dom__": true}});

        $Element.prototype.style.call(obj, styles);

        styles = "";

        _.forOwn(obj._node.style, function(value, key) {
            styles += ";" + key + ":" + value;
        });

        styles = styles.substr(1);
    }

    if (typeof selector !== "string" || typeof styles !== "string") {
        throw _.makeError("importStyles", this);
    }

    if (styleSheet.cssRules) {
        styleSheet.insertRule(selector + " {" + styles + "}", styleSheet.cssRules.length);
    } else {
        // ie doesn't support multiple selectors in addRule
        _.forEach(selector.split(","), function(selector) {
            styleSheet.addRule(selector, styles);
        });
    }

    return this;
};

// populate existing calls
_.forEach(args, function(args) { DOM.importStyles.apply(DOM, args) });
