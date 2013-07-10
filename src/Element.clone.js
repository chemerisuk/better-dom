define(["Element"], function($Element) {
    "use strict";

    /**
     * Clone element
     * @return {$Element} clone of current element
     */
    $Element.prototype.clone = function() {
        var node;

        if (document.addEventListener) {
            node = this._node.cloneNode(true);
        } else {
            node = document.createElement("div");
            node.innerHTML = this._node.outerHTML;
            node = node.firstChild;
        }
        
        return new $Element(node);
    };
});
