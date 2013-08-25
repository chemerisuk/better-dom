define(["DOM", "DOM.importstyles"], function(DOM, _forOwn, _makeError) {
    "use strict";

    // IMPORT STRINGS
    // --------------

    /**
     * Import global i18n string(s)
     * @memberOf DOM
     * @param {String|Object}  key     string key
     * @param {String}         pattern string pattern
     * @param {String}         [lang]  string language
     * @function
     * @example
     * // have element &#60;a data-i18n="str.1" data-user="Maksim"&#62;&#60;a&#62; in markup
     * DOM.importStrings("str.1", "Hello {user}!");
     * DOM.importStrings("str.1", "Привет!", "ru");
     * // the link text now is "Hello Maksim!"
     * link.set("lang", "ru");
     * // the link text now is "Привет!"
     */
    DOM.importStrings = (function() {
        var rparam = /\{([a-z\-]+)\}/g,
            toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\"" };

        return function(key, pattern, lang) {
            var keyType = typeof key,
                selector, content;

            if (keyType === "string") {
                selector = "[data-i18n=\"" + key + "\"]";

                if (lang) selector += ":lang(" + lang + ")";

                content = "content:\"" + pattern.replace(rparam, toContentAttr) + "\"";

                DOM.importStyles(selector + ":before", content);
            } else if (keyType === "object") {
                lang = pattern;

                _forOwn(key, function(pattern, key) {
                    DOM.importStrings(key, pattern, lang);
                });
            } else {
                throw _makeError("importStrings", this);
            }

            return this;
        };
    }());

    DOM.importStyles("[data-i18n]:before", "content:'???'attr(data-i18n)'???'");
});
