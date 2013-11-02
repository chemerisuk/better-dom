define(["Element"], function($Element, SelectorMatcher, documentElement, _getComputedStyle, _makeError) {
    "use strict";

    /**
     * Check if the element matches selector
     * @param  {String} selector css selector
     * @return {$Element}
     * @function
     */
    $Element.prototype.matches = (function() {
        var hooks = {};

        hooks[":focus"] = function(node) {
            return node === document.activeElement;
        };

        hooks[":hidden"] = function(node) {
            return node.getAttribute("aria-hidden") === "true" ||
                _getComputedStyle(node).display === "none" ||
                !documentElement.contains(node);
        };

        return function(selector, deep) {
            if (!selector || typeof selector !== "string" || deep !== undefined && typeof deep !== "boolean") {
                throw _makeError("matches", this);
            }

            var node = this._node,
                checker = hooks[selector] || SelectorMatcher(selector);

            while (node && node !== document) {
                if (checker(node)) return true;

                node = deep ? node.parentNode : null;
            }

            return false;
        };
    }());
});
