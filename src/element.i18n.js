var _ = require("./utils"),
    DOM = require("./dom"),
    $Element = require("./element"),
    importStyles = require("./dom.importstyles"),
    rparam = /\$\{([a-z\-]+)\}/g,
    toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\"" },
    setDataAttr = function(value, key) { this.setAttribute("data-" + key, value) },
    importStrings = function(lang, key, value) {
        var keyType = typeof key,
            selector, content;

        if (keyType === "string") {
            selector = "[data-i18n=\"" + key + "\"]";
            content = "content:\"" + value.replace(rparam, toContentAttr) + "\"";
            // empty lang is for internal use only
            if (lang) selector += ":lang(" + lang + ")";

            DOM.importStyles(selector + ":before", content, !lang);
        } else if (keyType === "object") {
            _.forOwn(key, function(value, key) { DOM.importStrings(lang, key, value) });
        } else {
            throw _.makeError("importStrings", true);
        }
    };

/**
 * Get/set localized value
 * @param  {String} [value]  resource string key
 * @param  {Object} [vars]   resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, vars) {
    var len = arguments.length,
        node = this._node;

    if (!len) return node.getAttribute("data-i18n");

    if (len > 2 || value && typeof value !== "string" || vars && typeof vars !== "object") throw _.makeError("i18n");

    // localized srings with variables require different css
    if (vars) importStrings("", value, value);
    // cleanup existing content
    node.innerHTML = "";
    // process variables
    _.forOwn(_.extend({i18n: value}, vars), setDataAttr, node);

    return this;
};

/**
 * Import global i18n string(s)
 * @memberOf DOM
 * @param {String}         lang    target language
 * @param {String|Object}  key     english string to localize or key/value object
 * @param {String}         value   localized string
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
DOM.importStrings = importStrings;

// by default just show data-i18n string
importStyles("[data-i18n]:before", "content:attr(data-i18n)");
