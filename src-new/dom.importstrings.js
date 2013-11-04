var _ = require("utils"),
    DOM = require("dom"),
    rparam = /\{([a-z\-]+)\}/g,
    toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\"" };

/**
 * Import global i18n string(s)
 * @memberOf DOM
 * @param {String|Object}  key     string key
 * @param {String}         pattern string pattern
 * @param {String}         [lang]  string language
 * @see https://github.com/chemerisuk/better-dom/wiki/Localization
 */
DOM.importStrings = function(key, pattern, lang) {
    var keyType = typeof key,
        selector, content;

    if (keyType === "string") {
        selector = "[data-i18n=\"" + key + "\"]";

        if (lang) selector += ":lang(" + lang + ")";

        content = "content:\"" + pattern.replace(rparam, toContentAttr) + "\"";

        DOM.importStyles(selector + ":before", content);
    } else if (keyType === "object") {
        lang = pattern;

        _.forOwn(key, function(pattern, key) {
            DOM.importStrings(key, pattern, lang);
        });
    } else {
        throw _.makeError("importStrings", this);
    }

    return this;
};
