var _ = require("./utils"),
    hooks = {};

hooks.value = function(node, value) {
    node.value = value;

    if (node.tagName === "SELECT") {
        _.forEach(node.options, function(option) {
            if (option.value === value) {
                option.selected = true;
                option.setAttribute("selected", "selected");
            }
        });
    }
};

hooks.defaultValue = function(node, value) {
    node.defaultValue = value;

    if (node.tagName === "SELECT") {
        _.forEach(node.options, function(option) {
            if (option.value === value) {
                option.selected = true;
                option.setAttribute("selected", "selected");
            }
        });
    }
};

if (!("textContent" in document.documentElement)) {
    hooks.textContent = function(node, value) {
        node.innerText = value;
    };
}

if (document.attachEvent) {
    // fix NoScope elements in IE < 10
    hooks.innerHTML = function(node, value) {
        node.innerHTML = "";
        node.appendChild(_.parseFragment(value));
    };
}

module.exports = hooks;
