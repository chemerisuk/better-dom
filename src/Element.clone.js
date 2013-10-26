define(["Element"], function($Element, _makeError) {
    "use strict";

    /**
     * Clone element
     * @param {Boolean} [deep=true] true if the children should also be cloned, or false to do shallow copy
     * @return {$Element} clone of current element
     */
    $Element.prototype.clone = function(deep) {
        var node = this._node;

        if (!node) return;

        if (!arguments.length) deep = true;

        if (typeof deep !== "boolean") throw _makeError("clone", this);

        if (document.addEventListener) {
            node = node.cloneNode(deep);
        } else {
            node = document.createElement("div");
            node.innerHTML = this._node.outerHTML;
            node = node.firstChild;

            if (!deep) node.innerHTML = "";
        }

        return new $Element(node);
    };
});
