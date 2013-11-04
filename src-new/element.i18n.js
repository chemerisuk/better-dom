var _ = require("utils"),
    $Element = require("element");

/**
 * Localize element value
 * @param  {String} [value]  resource string key
 * @param  {Object} [args]   resource string arguments
 */
$Element.prototype.i18n = function(value, args) {
    var len = arguments.length;

    if (!len) return this.get("data-i18n");

    if (len > 2 || typeof value !== "string" || args && typeof args !== "object") throw _.makeError("i18n", this);

    args = _.foldl(_.keys(args || {}), function(memo, key) {
        memo["data-" + key] = args[key];

        return memo;
    }, {"data-i18n": value});

    return this.set(args).set("");
};
