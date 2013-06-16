define(["DOM", "DOM.importstyles"], function(DOM, _forOwn) {
    "use strict";

    DOM.importStyles("[data-i18n]:before", "content:'???'attr(data-i18n)'???'");

    /**
     * Switch DOM language
     * @memberOf DOM
     * @param  {String} lang language abbreviation
     */
    DOM.setLanguage = function(lang) {
        DOM.create(document.documentElement).set("lang", lang);
    };

    /**
     * Return current language
     * @memberOf DOM
     * @return {String} language abbreviation
     */
    DOM.getLanguage = function() {
        return DOM.create(document.documentElement).get("lang");
    };

    /**
     * Add global i18n string
     * @memberOf DOM
     * @param {String} key     string key
     * @param {String} pattern string pattern
     * @param {String} [lang]  string language
     * @function
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
