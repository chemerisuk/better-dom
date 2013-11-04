var $Element = require("element");
/**
 * Show element
 * @return {$Element}
 */
$Element.prototype.show = function() {
    return this.set("aria-hidden", false);
};

/**
 * Hide element
 * @return {$Element}
 */
$Element.prototype.hide = function() {
    return this.set("aria-hidden", true);
};

/**
 * Toggle element visibility
 * @return {$Element}
 */
$Element.prototype.toggle = function() {
    return this.set("aria-hidden", function(value) { return value !== "true" });
};
