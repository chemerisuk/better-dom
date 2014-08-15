import _ from "../helpers";
import { DOCUMENT } from "../constants";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";

var reTest = /^(?:[a-zA-Z-]+|\s*(<.+>)\s*)$/,
    sandbox = DOCUMENT.createElement("body");

/**
 * Create a new DOM element in memory
 * @memberof DOM
 * @alias DOM.create
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} element wrapper
 */
DOM.create = function(value, varMap, /*INTERNAL*/all) {
    var test = reTest.exec(value),
        nodes;

    if (value && test && !test[1]) {
        nodes = [ DOCUMENT.createElement(value) ];
    } else {
        if (test && test[1]) {
            value = varMap ? DOM.format(test[1], varMap) : test[1];
        } else if (typeof value === "string") {
            value = DOM.emmet(value, varMap);
        } else {
            throw new StaticMethodError("create");
        }

        sandbox.innerHTML = value;

        for (nodes = []; value = sandbox.firstChild; sandbox.removeChild(value)) {
            if (value.nodeType === 1) nodes.push(value);
        }
    }

    if (all) {
        return _.map.call(nodes, $Element);
    } else {
        return $Element(nodes[0]);
    }
};

/**
 * Create a new DOM elements in memory
 * @memberof DOM
 * @alias DOM.createAll
 * @param  {String}       value     EmmetString or HTMLString
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {Array} elements wrapper
 */
DOM.createAll = function(value, varMap) {
    return DOM.create(value, varMap, true);
};
