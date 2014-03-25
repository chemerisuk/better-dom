import _ from "./utils";
import DOM from "./dom";
import $Element from "./element";

/**
 * Internationalization support
 * @module i18n
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */

var VALUE_SEPARATOR = "\n",
    readValue = (key) => {
        var value = sessionStorage["__" + key];

        return value ? value.split(VALUE_SEPARATOR) : [];
    },
    languages = readValue("");

/**
 * Get/set localized value
 * @memberOf module:i18n
 * @param  {String}       [key]     resource string key
 * @param  {Object|Array} [varMap]  resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(key, varMap) {
    if (!arguments.length) return this.get("data-i18n");

    if (key && typeof key !== "string" || varMap && typeof varMap !== "object") throw _.makeError("i18n");
    // update data-i18n-{lang} attributes
    var str = sessionStorage["__" + key];

    str = str ? [key].concat(str.split(VALUE_SEPARATOR)) : [key];

    str.forEach((value, index) => {
        var attrName = "data-i18n" + (index ? "-" + languages[index - 1] : "");

        if (value) this.set(attrName, varMap ? _.format(value, varMap) : value);
    });

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
        langIndex = languages.indexOf(lang),
        str;

    if (keyType === "string") {
        if (langIndex === -1) {
            langIndex = languages.push(lang) - 1;
            // add global rule for the data-i18n-{lang} attribute
            DOM.importStyles("[" + attrName + "]:lang(" + lang + "):before", "content:attr(" + attrName + ")");
            // persiste changed languages array
            sessionStorage.__ = languages.join(VALUE_SEPARATOR);
        }

        str = readValue(key);
        str[langIndex] = value;
        sessionStorage["__" + key] = str.join(VALUE_SEPARATOR);

        DOM.ready(() => DOM.findAll("[data-i18n=\"" + key + "\"]").set(attrName, value));
    } else if (keyType === "object") {
        _.forOwn(key, (value, key) => { DOM.importStrings(lang, key, value) });
    } else {
        throw _.makeError("importStrings", true);
    }
};

// by default just show data-i18n string
DOM.importStyles("[data-i18n]:before", "content:attr(data-i18n)");
