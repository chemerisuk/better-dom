import _ from "./utils";
import DOM from "./dom";
import $Element from "./element";

/**
 * Internationalization support
 * @module i18n
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
var strings = {},
    languages = [];

/**
 * Get/set localized value
 * @memberOf module:i18n
 * @param  {String}       [key]     resource string key
 * @param  {Object|Array} [varMap]  resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(key, varMap) {
    var len = arguments.length;

    if (!len) return this.get("data-i18n");

    if (len > 2 || key && typeof key !== "string" || varMap && typeof varMap !== "object") throw _.makeError("i18n");

    return this.set(languages.concat("").reduce((memo, lang, index) => {
        var value = key in strings && strings[key][index] || key,
            content = value && varMap ? _.format(value, varMap) : value;

        return memo + "<span data-i18n=" + lang + ">" + content + "</span>";
    }, ""));
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
        langIndex = languages.indexOf(lang);

    if (keyType === "string") {
        if (langIndex === -1) {
            langIndex = languages.push(lang) - 1;
            // add global rule for the data-i18n-{lang} attribute
            DOM.importStyles(":lang(" + lang + ") > [data-i18n]", "display:none");
            DOM.importStyles(":lang(" + lang + ") > [data-i18n=" + lang + "]", "display:inline");
        }

        if (!strings[key]) strings[key] = [];
        // store localized string internally
        strings[key][langIndex] = value;
    } else if (keyType === "object") {
        _.forOwn(key, (value, key) => { DOM.importStrings(lang, key, value) });
    } else {
        throw _.makeError("importStrings", true);
    }
};

// by default just show data-i18n attribute value
DOM.importStyles("[data-i18n]", "display:none");
DOM.importStyles("[data-i18n='']", "display:inline");
