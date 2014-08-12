import _ from "./util";
import DOM from "./index";
import { $Element, $Elements } from "./index";

var reTest = /^(?:\w+|\s*(<.+>)\s*)$/,
    sandbox = document.createElement("body");

/**
 * Create a new DOM element in memory
 * @memberOf DOM
 * @param  {Mixed}  value  EmmetString or HTMLString or native element
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element|$Elements} element(s) wrapper
 */
DOM.create = function(value, varMap) {
    if (value.nodeType === 1) return $Element(value);

    if (typeof value !== "string") throw _.makeError("create", true);

    var test = reTest.exec(value);

    if (test && !test[1]) {
        value = document.createElement(value);
    } else {
        if (test[1]) {
            value = varMap ? DOM.format(test[1], varMap) : test[1];
        } else {
            value = DOM.emmet(value, varMap);
        }

        sandbox.innerHTML = value;

        for (var nodes = []; value = sandbox.firstChild; sandbox.removeChild(value)) {
            if (value.nodeType === 1) nodes.push(value);
        }

        if (nodes.length !== 1) return new $Elements(nodes);

        value = nodes[0];
    }

    return new $Element(value);
};
