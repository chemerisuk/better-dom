import _ from "../helpers";
import { StaticMethodError } from "../errors";
import { DOM, $Element } from "../types";

/**
 * Creates Array of {@link $Element} instances from a native object(s)
 * @memberof DOM
 * @alias DOM.constructor
 * @param  {Mixed}  nodes  native HTMLElement or Array-like collection of HTMLElement
 * @return {Array} collection of {@link $Element} instances
 */
DOM.constructor = function(nodes) {
    if (!nodes) return [];

    if ("nodeType" in nodes) {
        nodes = [ nodes ];
    } else if ( !("length" in nodes) ) {
        throw new StaticMethodError("constructor");
    }

    return _.map.call(nodes, $Element);
};
