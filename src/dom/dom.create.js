import { DOCUMENT } from "../constants";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";

var reTest = /^(?:[a-zA-Z-]+|\s*(<.+>)\s*)$/,
    sandbox = DOCUMENT.createElement("body");

/**
 * Create a new DOM element in memory
 * @memberof DOM
 * @alias DOM.create
 * @param  {Mixed}  value  EmmetString or HTMLString or native element
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element|Array} element(s) wrapper
 */
DOM.create = function(value, varMap) {
    var test = reTest.exec(value);

    if (value && test && !test[1]) {
        value = DOCUMENT.createElement(value);
    } else {
        if (test && test[1]) {
            value = varMap ? DOM.format(test[1], varMap) : test[1];
        } else if (typeof value === "string") {
            value = DOM.emmet(value, varMap);
        } else {
            throw new StaticMethodError("create");
        }

        sandbox.innerHTML = value;

        for (var nodes = []; value = sandbox.firstChild; sandbox.removeChild(value)) {
            if (value.nodeType === 1) nodes.push(value);
        }

        if (nodes.length !== 1) return DOM.constructor(nodes);

        value = nodes[0];
    }

    return new $Element(value);
};
