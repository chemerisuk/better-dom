var features = require("./features"),
    hooks = {};

hooks.type = function(node) {
    // some browsers don't recognize input[type=email] etc.
    return node.getAttribute("type") || node.type;
};

if (!features.DOM2_EVENTS) {
    hooks.textContent = function(node) { return node.innerText };
}

module.exports = hooks;
