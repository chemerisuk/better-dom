import { StaticMethodError } from "../errors";
import { DOM, $Element } from "../types";

/* es6-transpiler has-iterators:false, has-generators: false */

/**
 * Create array of {@link $Element} instances from a native object(s)
 * @memberof DOM
 * @alias DOM.constructor
 * @param  {Mixed}  nodes  native HTMLElement or Array-like collection of HTMLElement
 * @return {Array.<$Element>} element wrappers
 */
DOM.constructor = function(nodes) {
    if (!nodes) return [];

    if ("nodeType" in nodes) {
        if (nodes.nodeType !== 1) return [];

        nodes = [ nodes ];
    } else if ( !("length" in nodes) ) {
        throw new StaticMethodError("constructor");
    }

    return [for (n of nodes) $Element(n)];
};
