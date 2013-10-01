define(["Element"], function($Element) {
    "use strict";

    /**
     * Clone element
     * @return {$Element} clone of current element
     */
    $Element.prototype.clone = function() {
        var node = this._node;

        if (!node) return;

        if (document.addEventListener) {
            node = node.cloneNode(true);
        } else {
            node = document.createElement("div");
            node.innerHTML = this._node.outerHTML;
            node = node.firstChild;
        }

        return new $Element(node);
    };
});
