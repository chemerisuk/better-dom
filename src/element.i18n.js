/**
 * Internationalization support
 * @module i18n
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
var _ = require("./utils"),
    DOM = require("./dom"),
    $Element = require("./element"),
    importStyles = require("./dom.importstyles"),
    strings = {},
    languages = [];

/**
 * Get/set localized value
 * @memberOf module:i18n
 * @param  {String}       [value]   resource string key
 * @param  {Object|Array} [varMap]  resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, varMap) {
    var len = arguments.length;

    if (!len) return this.get("data-i18n");

    if (len > 2 || value && typeof value !== "string" || varMap && typeof varMap !== "object") throw _.makeError("i18n");
    // update data-i18n-{lang} attributes
    [value].concat(strings[value]).forEach(function(value, index) {
        var attrName = "data-i18n" + (index ? "-" + languages[index - 1] : "");

        this.set(attrName, varMap ? _.format(value, varMap) : value);
    }, this);

    return this.set("");
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
        attrName = "data-i18n-" + lang,
        langIndex = languages.indexOf(lang);

    if (keyType === "string") {
        if (langIndex === -1) {
            langIndex = languages.push(lang) - 1;
            // add global rule for the data-i18n-{lang} attribute
            DOM.importStyles("[" + attrName + "]:lang(" + lang + "):before", "content:attr(" + attrName + ")");
        }

        if (!strings[key]) strings[key] = [];
        // store localized string internally
        strings[key][langIndex] = value;

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
