var $Element = require("./element"),
    DOM = require("./dom"),
    features = require("./features"),
    visibleFn = function(el) { return el.get("aria-hidden") !== "true" };

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
 * @param {Boolean|Function} [visible] true if the element should be visible and false otherwise
 * @return {$Element}
 */
$Element.prototype.toggle = function(visible) {
    var visibleType = typeof visible,
        value = visibleFn;

    if (visibleType === "boolean") {
        value = !visible;
    } else if (visibleType === "function") {
        value = function(el, index) { return !visible(el, index) };
    }

    return this.set("aria-hidden", value);
};

// [aria-hidden=true] could be overriden only if browser supports animations
// pointer-events:none helps to solve accidental clicks on a hidden element
DOM.importStyles("[aria-hidden=true]", "pointer-events:none; display:none" + (features.CSS3_ANIMATIONS ? "" : " !important"));
