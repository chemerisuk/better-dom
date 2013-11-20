var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    sandbox = document.createElement("div");

/**
 * Create a $Element instance
 * @memberOf DOM
 * @param  {Mixed}  value   HTMLString, EmmetString or native element
 * @param  {Object} [vars]  key/value map of variables in emmet template
 * @return {$Element} element
 */
DOM.create = function(value, vars) {
    if (typeof value === "string") {
        sandbox.innerHTML = _.trim(DOM.template(value, vars));

        if (sandbox.childNodes.length !== 1) {
            return $Element(sandbox).children().remove();
        }

        value = sandbox.removeChild(sandbox.firstChild);
    }

    if (value.nodeType === 1) return $Element(value);

    throw _.makeError("create", this);
};
