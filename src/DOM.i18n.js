define(["DOM", "DOM.importstyles"], function(DOM, _forOwn) {
    "use strict";

    DOM.importStyles("[data-i18n]:before", "content:'???'attr(data-i18n)'???'");

    /**
     * Switch current language to
     * @memberOf DOM
     * @param {String} lang language code
     * @see http://www.w3.org/TR/html401/struct/dirlang.html#adef-lang
     */
    DOM.setLanguage = function(lang) {
        DOM.create(document.documentElement).set("lang", lang);
    };

    /**
     * Return current language
     * @memberOf DOM
     * @return {String} language code
     * @see http://www.w3.org/TR/html401/struct/dirlang.html#adef-lang
     */
    DOM.getLanguage = function() {
        return DOM.create(document.documentElement).get("lang");
    };

    /**
     * Add global i18n string
     * @memberOf DOM
     * @param {String|Object}  key     string key
     * @param {String}         pattern string pattern
     * @param {String}         [lang]  string language
     * @function
     * @example
 * // have element &#60;a data-i18n="str.1" data-user="Maksim"&#62;&#60;a&#62; in markup
     * DOM.addLocaleString("str.1", "Hello {user}!");
     * // the link text now is "Hello Maksim!"
     * DOM.addLocaleString("str.1", "Привет!", "ru");
     * DOM.setLanguage("ru");
     * // the link text now is "Привет!"
     */
    DOM.addLocaleString = (function() {
        var rparam = /\{([a-z\-]+)\}/g,
            toContentAttr = function(term, attr) { return "\"attr(data-" + attr + ")\""; };

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
                    DOM.addLocaleString(key, pattern, lang);
                });
            }
        };
    }());
});
