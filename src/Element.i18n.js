define(["Element"], function($Element, _forEach, _foldl, _keys, _makeError) {
    "use strict";

    /**
     * Localize element value
     * @param  {String} [value]  resource string key
     * @param  {Object} [args]   resource string arguments
     */
    $Element.prototype.i18n = function(value, args) {
        var len = arguments.length;

        if (!len) return this.get("data-i18n");

        if (len > 2 || typeof value !== "string" || args && typeof args !== "object") throw _makeError("i18n", this);

        args = _foldl(_keys(args || {}), function(memo, key) {
            memo["data-" + key] = args[key];

            return memo;
        }, {"data-i18n": value});

        return this.set(args).set("");
    };
});
