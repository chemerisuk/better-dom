import _ from "../helpers";
import { DOCUMENT } from "../constants";
import { StaticMethodError } from "../errors";
import { $Element, DOM } from "../types";

var reTest = /^(?:[a-zA-Z-]+|\s*(<.+>)\s*)$/,
    sandbox = DOCUMENT.createElement("body");

/**
 * Create a new {@link $Element} from Emmet or HTML string
 * @memberof DOM
 * @alias DOM.create
 * @param  {String}       value     Emmet or HTML string
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {$Element} element wrapper
 */
DOM.create = function(value, varMap, /*INTERNAL*/all) {
    var test = reTest.exec(value),
        nodes, el;

    if (value && test && !test[1]) {
        nodes = DOCUMENT.createElement(value);

        if (all) nodes = [ nodes ];
    } else {
        if (test && test[1]) {
            value = varMap ? DOM.format(test[1], varMap) : test[1];
        } else if (typeof value === "string") {
            value = DOM.emmet(value, varMap);
        } else {
            throw new StaticMethodError("create");
        }

        sandbox.innerHTML = value; // parse input HTML string

        for (nodes = all ? [] : null; el = sandbox.firstChild; ) {
            sandbox.removeChild(el); // detach element from the sandbox

            if (el.nodeType === 1) {
                if (all) {
                    nodes.push(el);
                } else {
                    nodes = el;

                    break; // stop early, because need only the first element
                }
            }
        }
    }

    return all ? _.map.call(nodes, $Element) : $Element(nodes);
};

/**
 * Create a new array of {@link $Element}s from Emmet or HTML string
 * @memberof DOM
 * @alias DOM.createAll
 * @param  {String}       value     Emmet or HTML string
 * @param  {Object|Array} [varMap]  key/value map of variables
 * @return {Array.<$Element>} element wrappers
 * @example
 * DOM.createAll("span+b");
 * // => array with 2 $Elements: span and b
 *
 * DOM.createAll("li*5");
 * // => array with 5 li $Elements
 */
DOM.createAll = function(value, varMap) {
    return DOM.create(value, varMap, true);
};
