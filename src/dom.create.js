var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    rquick = /^\w+$/,
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
        if (rquick.test(value)) {
            value = document.createElement(value);
        } else {
            sandbox.innerHTML = _.trim(DOM.template(value, vars));

            if (sandbox.childNodes.length !== 1 || sandbox.firstChild.nodeType !== 1) {
                return $Element(sandbox).children().remove();
            }

            value = sandbox.removeChild(sandbox.firstChild);
        }

        return new $Element(value);
    }

    if (value.nodeType === 1) return $Element(value);

    throw _.makeError("create", this);
};
