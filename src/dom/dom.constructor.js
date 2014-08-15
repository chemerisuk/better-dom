import _ from "../helpers";
import { StaticMethodError } from "../errors";
import { DOM, $Element } from "../types";

/**
 * Creates Array of {@link $Element} instances from a native object(s)
 * @memberof DOM
 * @alias DOM.constructor
 * @param  {Mixed}  nodes  native HTMLElement or HTMLCollection
 * @return {Array} collection of {@link $Element} instances
 */
DOM.constructor = function(node) {
    if (!node) {
        node = [];
    } else if ("nodeType" in node) {
        node = [ node ];
    } else if ( !("length" in node) ) {
        throw new StaticMethodError("constructor");
    }

    return _.map.call(node, $Element);
};
