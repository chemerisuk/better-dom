var _ = require("./utils"),
    docEl = document.documentElement,
    hooks = {};

hooks[":focus"] = function(node) { return node === document.activeElement };

hooks[":hidden"] = function(node) {
    return node.getAttribute("aria-hidden") === "true" ||
        _.getComputedStyle(node).display === "none" || !docEl.contains(node);
};

hooks[":visible"] = function(node) { return !hooks[":hidden"](node) };

module.exports = hooks;
