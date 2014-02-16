/**
 * Internationalization support
 * @module i18n
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
var _ = require("./utils"),
    DOM = require("./dom"),
    $Element = require("./element"),
    importStyles = require("./dom.importstyles"),
    reVar = /\{([\w\-]+)\}/g,
    toContentAttr = function(_, attr) { return "\"attr(data-" + attr + ")\"" };

/**
 * Get/set localized value
 * @memberOf module:i18n
 * @param  {String}       [value]   resource string key
 * @param  {Object|Array} [varMap]  resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, varMap) {
    var len = arguments.length,
        node = this._node;

    if (!len) return node ? node.getAttribute("data-i18n") : undefined;

    if (len > 2 || value && typeof value !== "string" || varMap && typeof varMap !== "object") throw _.makeError("i18n");
    // localized srings with variables require different css
    if (varMap) DOM.importStrings("", value, value);

    varMap = _.extend({i18n: value}, varMap);

    return this.legacy(function(node) {
        // cleanup existing content
        node.innerHTML = "";
        // process variables
        _.forOwn(varMap, function(value, key) { node.setAttribute("data-" + key, value) });
    });
};

/**
 * Import global i18n string(s)
 * @memberOf module:i18n
 * @param {String}         lang    target language
 * @param {String|Object}  key     english string to localize or key/value object
 * @param {String}         value   localized string
 * @function
 */
DOM.importStrings = function(lang, key, value) {
    var keyType = typeof key,
        selector, content;

    if (keyType === "string") {
        selector = "[data-i18n=\"" + key + "\"]";
        content = "content:\"" + value.replace(reVar, toContentAttr) + "\"";
        // empty lang is for internal use only
        if (lang) selector += ":lang(" + lang + ")";

        DOM.importStyles(selector + ":before", content, !lang);
    } else if (keyType === "object") {
        _.forOwn(key, function(value, key) { DOM.importStrings(lang, key, value) });
    } else {
        throw _.makeError("importStrings", true);
    }
};

// by default just show data-i18n string
importStyles("[data-i18n]:before", "content:attr(data-i18n)");
