var features = require("./features"),
    hooks = {};

if (!features.DOM2_EVENTS) {
    hooks.textContent = function(node, value) {
        node.innerText = value;
    };
}

module.exports = hooks;
