/**
 * Testing if element matches a particular CSS selector support
 * @module matches
 */
var _ = require("./utils"),
    $Element = require("./element"),
    SelectorMatcher = require("./selectormatcher"),
    hooks = {};

/**
 * Check if the element matches selector
 * @memberOf module:matches
 * @param  {String} selector css selector
 * @return {$Element}
 */
$Element.prototype.matches = function(selector, deep) {
    if (!selector || typeof selector !== "string" || deep !== undefined && typeof deep !== "boolean") {
        throw _.makeError("matches");
    }

    var node = this._node,
        checker = hooks[selector] || SelectorMatcher(selector);

    while (node && node !== document) {
        if (checker(node)) return true;

        node = deep ? node.parentNode : null;
    }

    return false;
};

// $Element.matches hooks

hooks[":focus"] = function(node) { return node === document.activeElement };

hooks[":hidden"] = function(node) {
    return node.getAttribute("aria-hidden") === "true" ||
        _.getComputedStyle(node).display === "none" || !_.docEl.contains(node);
};

hooks[":visible"] = function(node) { return !hooks[":hidden"](node) };
