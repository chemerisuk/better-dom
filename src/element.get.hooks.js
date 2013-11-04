var hooks = {};

hooks.type = function(node) {
    // some browsers don't recognize input[type=email] etc.
    return node.getAttribute("type") || node.type;
};

if (!("textContent" in document.documentElement)) {
    hooks.textContent = function(node) { return node.innerText };
}

module.exports = hooks;
