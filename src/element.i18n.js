/**
 * Internationalization support
 * @module i18n
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
var _ = require("./utils"),
    DOM = require("./dom"),
    $Element = require("./element"),
    importStyles = require("./dom.importstyles"),
    strings = {};

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

    this.set("").set("data-i18n", varMap ? _.format(value, varMap) : value);
    // set localized strings
    return _.forOwn(strings[value] || {}, function(value, lang) {
        this.set("data-i18n-" + lang, varMap ? _.format(value, varMap) : value);
    }, this);
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
        entry = strings[key],
        attrName = "data-i18n-" + lang;

    if (keyType === "string") {
        if (!entry) strings[key] = entry = {};

        entry[lang] = value;

        DOM.importStyles("[" + attrName + "]:lang(" + lang + "):before", "content:attr(" + attrName + ")");

        DOM.ready(function() {
            DOM.findAll("[data-i18n=\"" + key + "\"]").set(attrName, value);
        });
    } else if (keyType === "object") {
        _.forOwn(key, function(value, key) { DOM.importStrings(lang, key, value) });
    } else {
        throw _.makeError("importStrings", true);
    }
};

// by default just show data-i18n string
importStyles("[data-i18n]:before", "content:attr(data-i18n)");
