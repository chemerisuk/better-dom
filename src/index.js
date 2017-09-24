import { WINDOW, ELEMENT_NODE, DOCUMENT_NODE } from "./const";

import { $Node } from "./node/index";
import { $Document } from "./document/index";
import { $Element } from "./element/index";

/**
 * Global namespace to access the document object tree
 * @namespace DOM
 * @extends {$Document}
 */
const DOM = new $Document(WINDOW.document);
const _DOM = WINDOW.DOM;

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
DOM.$ = (node) => {
    const nodeType = node && node.nodeType;

    if (nodeType === ELEMENT_NODE) {
        return $Element(node);
    } else if (nodeType === DOCUMENT_NODE) {
        return $Document(node);
    } else {
        return new $Node();
    }
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
