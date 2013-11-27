var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    reSingleTag = /^\w+$/,
    sandbox = document.createElement("div");

/**
 * Create a $Element instance
 * @memberOf DOM
 * @param  {Mixed}  value   HTMLString, EmmetString or native element
 * @param  {Object} [vars]  key/value map of variables in emmet template
 * @return {$Element} element
 */
DOM.create = function(value, vars) {
    if (value.nodeType === 1) return $Element(value);

    if (typeof value !== "string") throw _.makeError("create", this);

    var node, multiple;

    if (reSingleTag.test(value)) {
        value = document.createElement(value);
    } else {
        sandbox.innerHTML = DOM.template(value, vars);

        for (value = []; node = sandbox.firstChild; sandbox.removeChild(node)) {
            if (node.nodeType === 1) value.push(node);
        }

        multiple = value.length !== 1;

        if (!multiple) value = value[0];
    }

    return new $Element(value, multiple);
};
