define(["Element"], function(DOMElement, DOMElementCollection, SelectorMatcher) {
    "use strict";

    // TRAVERSING
    // ----------
    
    (function() {
        function makeTraversingMethod(propertyName, multiple) {
            return function(selector) {
                var matcher = SelectorMatcher(selector),
                    nodes = multiple ? [] : null,
                    it = this._node;

                while (it = it[propertyName]) {
                    if (it.nodeType === 1 && (!matcher || matcher.test(it))) {
                        if (!multiple) break;

                        nodes.push(it);
                    }
                }

                return multiple ? new DOMElementCollection(nodes) : DOMElement(it);
            };
        }

        function makeChildTraversingMethod(multiple) {
            return function(index, selector) {
                if (multiple) {
                    selector = index;
                } else if (typeof index !== "number") {
                    throw this.makeError("child");
                }

                var children = this._node.children,
                    matcher = SelectorMatcher(selector),
                    el;

                if (!document.addEventListener) {
                    // fix IE8 bug with children collection
                    children = _.filter(children, function(el) {
                        return el.nodeType === 1;
                    });
                }

                if (multiple) {
                    return new DOMElementCollection(!matcher ? children :
                        _.filter(children, matcher.test, matcher));
                }

                if (index < 0) index = children.length + index;

                el = children[index];

                return DOMElement(!matcher || matcher.test(el) ? el : null);
            };
        }

        /**
         * Find next sibling element filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.next = makeTraversingMethod("nextSibling");

        /**
         * Find previous sibling element filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.prev = makeTraversingMethod("previousSibling");

        /**
         * Find all next sibling elements filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.nextAll = makeTraversingMethod("nextSibling", true);

        /**
         * Find all previous sibling elements filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.prevAll = makeTraversingMethod("previousSibling", true);

        /**
         * Find parent element filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param {String} [selector] css selector
         * @return {DOMElement} matched element
         * @function
         */
        DOMElement.prototype.parent = makeTraversingMethod("parentNode");

        /**
         * Return child element by index filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param  {Number} index child index
         * @param  {String} [selector] css selector
         * @return {DOMElement} matched child
         * @function
         * @example
         * var body = DOM.find("body");
         *
         * body.child(0); // => first child
         * body.child(-1); // => last child
         */
        DOMElement.prototype.child = makeChildTraversingMethod(false);

        /**
         * Fetch children elements filtered by optional selector
         * @memberOf DOMElement.prototype
         * @param  {String} [selector] css selector
         * @return {DOMElementCollection} matched elements
         * @function
         */
        DOMElement.prototype.children = makeChildTraversingMethod(true);
    })();
});