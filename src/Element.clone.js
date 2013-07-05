define(["Element"], function($Element, _createElement) {
    "use strict";

    /**
     * Clone element
     * @return {$Element} clone of current element
     */
    $Element.prototype.clone = function() {
        var el;

        if (document.addEventListener) {
            el = this._node.cloneNode(true);
        } else {
            el = _createElement("div");
            el.innerHTML = this._node.outerHTML;
            el = el.firstChild;
        }
        
        return new $Element(el);
    };
});