define(["Element"], function($Element) {
    "use strict";

    /**
     * Show element
     * @return {$Element}
     */
    $Element.prototype.show = function() {
        this.set("hidden", false);

        return this;
    };

    /**
     * Hide element
     * @return {$Element}
     */
    $Element.prototype.hide = function() {
        this.set("hidden", true);

        return this;
    };

    /**
     * Toggle element visibility
     * @return {$Element}
     */
    $Element.prototype.toggle = function() {
        this.set("hidden", !this.get("hidden"));

        return this;
    };

    /**
     * Check is element is hidden
     * @return {Boolean} true if element is hidden
     */
    $Element.prototype.isHidden = function() {
        return !!this.get("hidden");
    };

    /**
     * Check if element has focus
     * @return {Boolean} true if current element is focused
     */
    $Element.prototype.isFocused = function() {
        return this._node === document.activeElement;
    };
});