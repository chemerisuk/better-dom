import { DOM, WINDOW } from "./const";
import { $Document, $Element } from "./types";

var _DOM = WINDOW.DOM;

/**
 * Create an instance of {@link $Element} or {@link $Document} for a native element
 * @memberof DOM
 * @alias DOM.constructor
 * @param {Object}  [node]  native element
 * @return {$Element|$Document} a wrapper object
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

/**
 * Restore previous DOM namespace
 * @memberof DOM
 * @alias DOM.noConflict
 * @return {$Element} previous DOM namespace
 */
DOM.noConflict = function() {
    if (WINDOW.DOM === DOM) {
        WINDOW.DOM = _DOM;
    }

    return DOM;
};

WINDOW.DOM = DOM;
