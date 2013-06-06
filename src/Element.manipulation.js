define(["Element"], function(DOMElement, _parseFragment) {
    "use strict";

    // MANIPULATION
    // http://www.w3.org/TR/domcore/
    // 5.2.2 Mutation methods
    
    (function() {
        function makeManipulationMethod(methodName, fasterMethodName, strategy) {
            // always use _parseFragment because of HTML5 and NoScope bugs in IE
            /*@ fasterMethodName = false; @*/

            return function(value, /*INTERNAL*/reverse) {
                var el = reverse ? value : this._node,
                    relatedNode = el.parentNode;

                if (reverse) value = this._node;

                if (typeof value === "string") {
                    if (value[0] !== "<") value = DOM.parseTemplate(value);

                    relatedNode = fasterMethodName ? null : _parseFragment(value);
                } else if (value && (value.nodeType === 1 || value.nodeType === 11)) {
                    relatedNode = value;
                } else if (value instanceof DOMElement) {
                    value[methodName](el, true);

                    return this;
                } else if (value !== undefined) {
                    throw this.makeError(methodName);
                }

                if (relatedNode) {
                    strategy(el, relatedNode);
                } else {
                    el.insertAdjacentHTML(fasterMethodName, value);
                }

                return this;
            };
        }

        /**
         * Insert html string or native element after the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.after = makeManipulationMethod("after", "afterend", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node.nextSibling);
        });

        /**
         * Insert html string or native element before the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.before = makeManipulationMethod("before", "beforebegin", function(node, relatedNode) {
            node.parentNode.insertBefore(relatedNode, node);
        });

        /**
         * Prepend html string or native element to the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.prepend = makeManipulationMethod("prepend", "afterbegin", function(node, relatedNode) {
            node.insertBefore(relatedNode, node.firstChild);
        });

        /**
         * Append html string or native element to the current
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.append = makeManipulationMethod("append", "beforeend", function(node, relatedNode) {
            node.appendChild(relatedNode);
        });

        /**
         * Replace current element with html string or native element
         * @memberOf DOMElement.prototype
         * @param {String|Element|DOMElement} content HTML string or Element
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.replace = makeManipulationMethod("replace", "", function(node, relatedNode) {
            node.parentNode.replaceChild(relatedNode, node);
        });

        /**
         * Remove current element from DOM
         * @memberOf DOMElement.prototype
         * @return {DOMElement} reference to this
         * @function
         */
        DOMElement.prototype.remove = makeManipulationMethod("remove", "", function(node, parentNode) {
            parentNode.removeChild(node);
        });
    })();
});