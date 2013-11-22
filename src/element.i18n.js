var _ = require("./utils"),
    $Element = require("./element");

/**
 * Get/set localized value
 * @param  {String} [value]  resource string key
 * @param  {Object} [vars]   resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, vars) {
    var len = arguments.length;

    if (!len) return this.get("data-i18n");

    if (len > 2 || value && typeof value !== "string" || vars && typeof vars !== "object") throw _.makeError("i18n", this);

    // localized srings with variables require different css
    if (vars) DOM.importStrings("", value, value);
    // cleanup existing content
    this.set("");
    // process variables
    _.forOwn(_.extend({i18n: value}, vars), function(value, key) {
        this.set("data-" + key, value);
    }, this);

    // IMPORTANT: set empty value twice to fix IE8 quirks
    return this.set("");
};
