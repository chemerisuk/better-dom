define(["Element"], function($Element, _parseFragment, _makeError) {
    "use strict";

    // MANIPULATION
    // ------------
    
    (function() {
        function makeManipulationMethod(methodName, fasterMethodName, strategy) {
            // always use _parseFragment because of HTML5 and NoScope bugs in IE
            if (document.attachEvent) fasterMethodName = false;

            return function(value) {
                var node = this._node,
                    relatedNode = node.parentNode;

                if (typeof value === "string") {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    relatedNode = fasterMethodName ? null : _parseFragment(value);
                } else if (value && (value.nodeType === 1 || value.nodeType === 11)) {
                    relatedNode = value;
                } else if (value instanceof $Element) {
                    value.each(function(el) { this[methodName](el._node); }, this);

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
        }

        /**
         * Insert html string or native element after the current
         * @param {String|Element|$Element} content HTML string or Element
         * @return {$Element}
         * @function
         */
        $Element.prototype.after = makeManipulationMethod("after", "afterend", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        });

        /**
         * Insert html string or native element before the current
         * @param {String|Element|$Element} content HTML string or Element
         * @return {$Element}
         * @function
         */
        $Element.prototype.before = makeManipulationMethod("before", "beforebegin", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node);
        });

        /**
         * Prepend html string or native element to the current
         * @param {String|Element|$Element} content HTML string or Element
         * @return {$Element}
         * @function
         */
        $Element.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", function(node, relatedNode) {
            node.insertBefore(relatedNode, node.firstChild);
        });

        /**
         * Append html string or native element to the current
         * @param {String|Element|$Element} content HTML string or Element
         * @return {$Element}
         * @function
         */
        $Element.prototype.append = makeManipulationMethod("append", "beforeend", function(node, relatedNode) {
            node.appendChild(relatedNode);
        });

        /**
         * Replace current element with html string or native element
         * @param {String|Element|$Element} content HTML string or Element
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
