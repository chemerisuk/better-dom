define(["Element", "CompositeElement"], function($Element, $CompositeElement, _forEach) {
    "use strict";

    /**
     * Executes code in a 'unsafe' block there the first callback argument is native DOM
     * object. Use only when you need to communicate better-dom with third party scripts!
     * @memberOf $Element.prototype
     * @param  {Function} block unsafe block body (nativeNode, index)
     */
    $Element.prototype.legacy = function(block) {
        return _forEach(this, function(el, index) {
            block.call(this, el._node, el, index);
        }, this);
    };
});
