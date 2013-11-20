var $Element = require("./element"),
    DOM = require("./dom"),
    features = require("./features");

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

// [aria-hidden=true] could be overriden only if browser supports animations
// pointer-events:none helps to solve accidental clicks on a hidden element
DOM.importStyles("[aria-hidden=true]", "pointer-events:none; display:none" + (features.CSS3_ANIMATIONS ? "" : " !important"));
