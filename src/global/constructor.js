import { DOM } from "../const";
import { $Document, $Element } from "../types";

/**
 * Create a {@link $Element} for a native DOM element
 * @memberof DOM
 * @alias DOM.constructor
 * @param {Object}  [node]  native element
 * @return {$Element} a wrapper object
 * @example
 * var bodyEl = DOM.constructor(document.body);
 * // bodyEl is an instance of $Element
 * bodyEl.hide();
 */
DOM.constructor = (node) => {
    var nodeType = node && node.nodeType,
        ctr = nodeType === 9 ? $Document : $Element;
    // filter non elements like text nodes, comments etc.
    return ctr(nodeType === 1 || nodeType === 9 ? node : null);
};
