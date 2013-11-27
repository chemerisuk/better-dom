var _ = require("./utils"),
    hooks = {};

hooks[":focus"] = function(node) {
    return node === document.activeElement;
};

hooks[":hidden"] = function(node) {
    return _.getComputedStyle(node).display === "none" || !node.offsetWidth;
};

module.exports = hooks;
