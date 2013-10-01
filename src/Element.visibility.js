define(["Element"], function($Element) {
    "use strict";

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
        return this.set("aria-hidden", !this.isHidden());
    };

    /**
     * Check is element is hidden
     * @return {Boolean} true if element is hidden
     */
    $Element.prototype.isHidden = function() {
        if (!this._node) return;

        return this.get("aria-hidden") === "true";
    };

    /**
     * Check if element has focus
     * @return {Boolean} true if current element is focused
     */
    $Element.prototype.isFocused = function() {
        if (!this._node) return;

        return this._node === document.activeElement;
    };
});
