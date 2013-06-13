define(["Element"], function(DOMElement) {
    "use strict";

    /**
     * Show element
     * @memberOf DOMElement.prototype
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.show = function() {
        this.set("hidden", false);

        return this;
    };

    /**
     * Hide element
     * @memberOf DOMElement.prototype
     * @return {DOMElement} reference to this
     */
    DOMElement.prototype.hide = function() {
        this.set("hidden", true);

        return this;
    };

    /**
     * Check is element is hidden
     * @memberOf DOMElement.prototype
     * @return {Boolean} true if element is hidden
     */
    DOMElement.prototype.isHidden = function() {
        return !!this.get("hidden");
    };

    /**
     * Check if element has focus
     * @memberOf DOMElement.prototype
     * @return {Boolean} true if current element is focused
     */
    DOMElement.prototype.isFocused = function() {
        return this._node === document.activeElement;
    };
});