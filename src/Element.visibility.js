define(["Element"], function(DOMElement) {
    "use strict";

    /**
     * Show element
     * @return {DOMElement}
     */
    DOMElement.prototype.show = function() {
        this.set("hidden", false);

        return this;
    };

    /**
     * Hide element
     * @return {DOMElement}
     */
    DOMElement.prototype.hide = function() {
        this.set("hidden", true);

        return this;
    };

    /**
     * Toggle element visibility
     * @return {DOMElement}
     */
    DOMElement.prototype.toggle = function() {
        this.set("hidden", !this.get("hidden"));

        return this;
    };

    /**
     * Check is element is hidden
     * @return {Boolean} true if element is hidden
     */
    DOMElement.prototype.isHidden = function() {
        return !!this.get("hidden");
    };

    /**
     * Check if element has focus
     * @return {Boolean} true if current element is focused
     */
    DOMElement.prototype.isFocused = function() {
        return this._node === document.activeElement;
    };
});