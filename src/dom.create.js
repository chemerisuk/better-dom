var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    reSingleTag = /^\w+$/,
    sandbox = document.createElement("div");

/**
 * Create a $Element instance
 * @memberOf DOM
 * @param  {Mixed}  value   HTMLString, EmmetString or native element
 * @param  {Object} [varMap]  key/value map of variables in emmet template
 * @return {$Element} element
 */
DOM.create = function(value, varMap) {
    if (value.nodeType === 1) return $Element(value);

    if (typeof value !== "string") throw _.makeError("create", true);

    var node;

    if (reSingleTag.test(value)) {
        value = document.createElement(value);
    } else {
        sandbox.innerHTML = _.template(value, varMap);

        for (value = []; node = sandbox.firstChild; sandbox.removeChild(node)) {
            if (node.nodeType === 1) value.push(node);
        }

        if (value.length !== 1) return _.makeCollection(value);

        value = value[0];
    }

    return new $Element(value);
};
