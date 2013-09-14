define(["Element"], function($Element, _parseFragment, _forEach, _makeError) {
    "use strict";

    // MANIPULATION
    // ------------

    (function() {
        function makeManipulationMethod(methodName, fasterMethodName, strategy) {
            // always use _parseFragment because of HTML5 and NoScope bugs in IE
            if (document.attachEvent && !window.CSSKeyframesRule) fasterMethodName = false;

            var manipulateContent = function(value) {
                var valueType = typeof value,
                    node = this._node,
                    relatedNode = node.parentNode;

                if (valueType === "function") {
                    value = value.call(this);
                    valueType = typeof value;
                }

                if (valueType === "string") {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    relatedNode = fasterMethodName ? null : _parseFragment(value);
                } else if (value instanceof $Element) {
                    value.each(function(el) { strategy(node, el._node); });

                    return this;
                } else if (value !== undefined) {
                    throw _makeError(methodName, this);
                }

                if (relatedNode) {
                    strategy(node, relatedNode);
                } else {
                    node.insertAdjacentHTML(fasterMethodName, value);
                }

                return this;
            };

            return !fasterMethodName ? manipulateContent : function() {
                _forEach(arguments, manipulateContent, this);

                return this;
            };
        }

        /**
         * Insert html string or $Element after the current
         * @param {...Mixed} content HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.after = makeManipulationMethod("after", "afterend", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        });

        /**
         * Insert html string or $Element before the current
         * @param {...Mixed} content HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.before = makeManipulationMethod("before", "beforebegin", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node);
        });

        /**
         * Prepend html string or $Element to the current
         * @param {...Mixed} content HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", function(node, relatedNode) {
            node.insertBefore(relatedNode, node.firstChild);
        });

        /**
         * Append html string or $Element to the current
         * @param {...Mixed} content HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.append = makeManipulationMethod("append", "beforeend", function(node, relatedNode) {
            node.appendChild(relatedNode);
        });

        /**
         * Replace current element with html string or $Element
         * @param {Mixed} content HTMLString or $Element or functor that returns content
         * @return {$Element}
         * @function
         */
        $Element.prototype.replace = makeManipulationMethod("replace", "", function(node, relatedNode) {
            node.parentNode.replaceChild(relatedNode, node);
        });

        /**
         * Remove current element from DOM
         * @return {$Element}
         * @function
         */
        $Element.prototype.remove = makeManipulationMethod("remove", "", function(node, parentNode) {
            parentNode.removeChild(node);
        });
    })();
});
