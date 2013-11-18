var _ = require("./utils"),
    DOM = require("./dom"),
    rparam = /\$\{([a-z\-]+)\}/g,
    toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\"" };

/**
 * Import global i18n string(s)
 * @memberOf DOM
 * @param {String}         lang    target language
 * @param {String|Object}  key     localized string key
 * @param {String}         value   localized string value
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
DOM.importStrings = function(lang, key, value) {
    var keyType = typeof key,
        selector, content;

    if (keyType === "string") {
        selector = "[data-i18n=\"" + key + "\"]:lang(" + lang + "):before";
        content = "content:\"" + value.replace(rparam, toContentAttr) + "\"";

        DOM.importStyles(selector, content);
    } else if (keyType === "object") {
        _.forOwn(key, function(value, key) { DOM.importStrings(lang, key, value) });
    } else {
        throw _.makeError("importStrings", this);
    }

    return this;
};
