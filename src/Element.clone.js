define(["Element"], function(DOMElement, _createElement) {
    "use strict";

    /**
     * Clone element
     * @return {DOMElement} clone of current element
     */
    DOMElement.prototype.clone = function() {
        var el;

        if (document.addEventListener) {
            el = this._node.cloneNode(true);
        } else {
            el = _createElement("div");
            el.innerHTML = this._node.outerHTML;
            el = el.firstChild;
        }
        
        return new DOMElement(el);
    };
});