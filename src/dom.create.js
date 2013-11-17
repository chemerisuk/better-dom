var _ = require("./utils"),
    $Element = require("./element"),
    DOM = require("./dom"),
    rquick = /^[a-z]+$/;

/**
 * Create a $Element instance
 * @memberOf DOM
 * @param  {Mixed}   value        HTMLString, EmmetString or native element
 * @param  {Object}  [attributes] map of the element attributes
 * @param  {Object}  [styles]     map of the element styles
 * @return {$Element} element
 */
DOM.create = function(value, attributes, styles) {
    if (typeof value === "string") {
        if (rquick.test(value)) {
            value = document.createElement(value);
        } else {
            var sandbox = document.createElement("div");

            sandbox.innerHTML = _.trim(DOM.template(value));

            if (sandbox.childNodes.length === 1 && sandbox.firstChild.nodeType === 1) {
                // remove temporary element
                value = sandbox.removeChild(sandbox.firstChild);
            } else {
                value = sandbox;
            }
        }

        value = new $Element(value);

        if (attributes) value.set(attributes);
        if (styles) value.style(styles);

        return value;
    }

    if (value.nodeType === 1) return $Element(value);

    throw _.makeError("create", this);
};
