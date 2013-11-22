var _ = require("./utils"),
    $Element = require("./element"),
    initialized = {};

/**
 * Get/set localized value
 * @param  {String} [value]  resource string key
 * @param  {Object} [args]   resource string arguments
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, args) {
    var len = arguments.length;

    if (!len) return this.get("data-i18n");

    if (len > 2 || value && typeof value !== "string" || args && typeof args !== "object") throw _.makeError("i18n", this);

    if (args && !initialized[value]) {
        // "str ${param}" requires different default css
        DOM.importStrings("", value, value);

        initialized[value] = true;
    }

    args = _.foldl(_.keys(args || {}), function(memo, key) {
        memo["data-" + key] = args[key];

        return memo;
    }, {"data-i18n": value});

    // IMPORTANT: set empty value twice to fix IE8 quirks
    return this.set("").set(args).set("");
};
