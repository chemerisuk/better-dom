var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher");

function makeTraversingMethod(propertyName, multiple) {
    return function(selector) {
        var matcher = SelectorMatcher(selector),
            nodes = multiple ? [] : null,
            it = this._node;

        if (it) {
            while (it = it[propertyName]) {
                if (it.nodeType === 1 && (!matcher || matcher(it))) {
                    if (!multiple) break;

                    nodes.push(it);
                }
            }
        }

        return multiple ? new $Element(nodes, multiple) : $Element(it);
    };
}

function makeChildTraversingMethod(multiple) {
    return function(index, selector) {
        if (multiple) {
            selector = index;
        } else if (typeof index !== "number") {
            throw _.makeError("child");
        }

        if (!this._node) return new $Element();

        var children = this._node.children,
            matcher = SelectorMatcher(selector),
            node;

        if (!_.DOM2_EVENTS) {
            // fix IE8 bug with children collection
            children = _.filter(children, function(node) { return node.nodeType === 1 });
        }

        if (multiple) {
            return new $Element(!matcher ? children : _.filter(children, matcher), true);
        }

        if (index < 0) index = children.length + index;

        node = children[index];

        return $Element(!matcher || matcher(node) ? node : null);
    };
}

/**
 * Find next sibling element filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} matched element
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.next = makeTraversingMethod("nextSibling");

/**
 * Find previous sibling element filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} matched element
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.prev = makeTraversingMethod("previousSibling");

/**
 * Find all next sibling elements filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} collection of matched elements
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.nextAll = makeTraversingMethod("nextSibling", true);

/**
 * Find all previous sibling elements filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} collection of matched elements
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.prevAll = makeTraversingMethod("previousSibling", true);

/**
 * Find parent element filtered by optional selector
 * @param {String} [selector] css selector
 * @return {$Element} matched element
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.parent = makeTraversingMethod("parentNode");

/**
 * Return child element by index filtered by optional selector
 * @param  {Number} index child index
 * @param  {String} [selector] css selector
 * @return {$Element} matched child
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.child = makeChildTraversingMethod(false);

/**
 * Fetch children elements filtered by optional selector
 * @param  {String} [selector] css selector
 * @return {$Element} collection of matched elements
 * @function
 * @see https://github.com/chemerisuk/better-dom/wiki/Traversing
 */
$Element.prototype.children = makeChildTraversingMethod(true);
