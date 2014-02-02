var _ = require("./utils"),
    $Element = require("./element"),
    setDataAttr = function(value, key) { this.setAttribute("data-" + key, value) };

/**
 * Get/set localized value
 * @param  {String} [value]  resource string key
 * @param  {Object} [vars]   resource string variables
 * @return {String|$Element}
 */
$Element.prototype.i18n = function(value, vars) {
    var len = arguments.length,
        node = this._node;

    if (!len) return node.getAttribute("data-i18n");

    if (len > 2 || value && typeof value !== "string" || vars && typeof vars !== "object") throw _.makeError("i18n");

    // localized srings with variables require different css
    if (vars) DOM.importStrings("", value, value);
    // cleanup existing content
    node.innerHTML = "";
    // process variables
    _.forOwn(_.extend({i18n: value}, vars), setDataAttr, node);

    return this;
};
