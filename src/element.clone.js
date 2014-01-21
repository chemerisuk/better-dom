var _ = require("./utils"),
    $Element = require("./element");

/**
 * Clone element
 * @param {Boolean} [deep=true] true if all children should also be cloned, or false otherwise
 * @return {$Element} clone of current element
 */
$Element.prototype.clone = function(deep) {
    if (!arguments.length) deep = true;

    if (typeof deep !== "boolean") throw _.makeError("clone");

    var node = this[_.NODE];

    if (node) {
        if (_.DOM2_EVENTS) {
            node = node.cloneNode(deep);
        } else {
            node = document.createElement("div");
            node.innerHTML = this[_.NODE].outerHTML;
            node = node.firstChild;

            if (!deep) node.innerHTML = "";
        }
    }

    return new $Element(node);
};
