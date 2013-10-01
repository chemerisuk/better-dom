define(["Element"], function($Element, $CompositeElement, SelectorMatcher, _filter, _makeError) {
    "use strict";

    // TRAVERSING
    // ----------

    (function() {
        function makeTraversingMethod(propertyName, multiple) {
            return function(selector) {
                var matcher = SelectorMatcher(selector),
                    nodes = multiple ? [] : null,
                    it = this._node;

                if (!it) return;

                while (it = it[propertyName]) {
                    if (it.nodeType === 1 && (!matcher || matcher.test(it))) {
                        if (!multiple) break;

                        nodes.push(it);
                    }
                }

                return multiple ? new $CompositeElement(nodes) : $Element(it);
            };
        }

        function makeChildTraversingMethod(multiple) {
            return function(index, selector) {
                if (multiple) {
                    selector = index;
                } else if (typeof index !== "number") {
                    throw _makeError("child", this);
                }

                if (!this._node) return;

                var children = this._node.children,
                    matcher = SelectorMatcher(selector),
                    node;

                if (!document.addEventListener) {
                    // fix IE8 bug with children collection
                    children = _filter(children, function(node) { return node.nodeType === 1 });
                }

                if (multiple) {
                    return new $CompositeElement(!matcher ? children : _filter(children, matcher.test, matcher));
                }

                if (index < 0) index = children.length + index;

                node = children[index];

                return $Element(!matcher || matcher.test(node) ? node : null);
            };
        }

        /**
         * Find next sibling element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} matched element
         * @function
         */
        $Element.prototype.next = makeTraversingMethod("nextSibling");

        /**
         * Find previous sibling element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} matched element
         * @function
         */
        $Element.prototype.prev = makeTraversingMethod("previousSibling");

        /**
         * Find all next sibling elements filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} collection of matched elements
         * @function
         */
        $Element.prototype.nextAll = makeTraversingMethod("nextSibling", true);

        /**
         * Find all previous sibling elements filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} collection of matched elements
         * @function
         */
        $Element.prototype.prevAll = makeTraversingMethod("previousSibling", true);

        /**
         * Find parent element filtered by optional selector
         * @param {String} [selector] css selector
         * @return {$Element} matched element
         * @function
         */
        $Element.prototype.parent = makeTraversingMethod("parentNode");

        /**
         * Return child element by index filtered by optional selector
         * @param  {Number} index child index
         * @param  {String} [selector] css selector
         * @return {$Element} matched child
         * @function
         * @tutorial Traversing
         */
        $Element.prototype.child = makeChildTraversingMethod(false);

        /**
         * Fetch children elements filtered by optional selector
         * @param  {String} [selector] css selector
         * @return {$Element} collection of matched elements
         * @function
         * @tutorial Traversing
         */
        $Element.prototype.children = makeChildTraversingMethod(true);
    })();
});
