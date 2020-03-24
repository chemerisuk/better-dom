import { WINDOW, ELEMENT_NODE, DOCUMENT_NODE } from "./const";

import { $Node } from "./node/index";
import { $Document } from "./document/index";
import { $Element } from "./element/index";

/**
 * Global object to access the current page document tree
 * @global
 */
const DOM = new $Document(WINDOW.document);
const _DOM = WINDOW.DOM;

/**
 * Create an instance of {@link $Element} or {@link $Document} for a native element
 * @param {Object} [node] native element
 * @return {$Element|$Document} a wrapper object
 * @example
 * var bodyEl = DOM.$(document.body);
 * // bodyEl is an instance of $Element
 * bodyEl.hide();
 */
DOM.constructor = (node) => {
    const nodeType = node && node.nodeType;

    if (nodeType === ELEMENT_NODE) {
        return $Element(node);
    } else if (nodeType === DOCUMENT_NODE) {
        return $Document(node);
    } else {
        return new $Node(node);
    }
};

/**
 * Restore previous DOM namespace
 * @return {$Element} previous DOM namespace
 */
DOM.noConflict = function() {
    if (WINDOW.DOM === DOM) {
        WINDOW.DOM = _DOM;
    }

    return DOM;
};

WINDOW.DOM = DOM;
