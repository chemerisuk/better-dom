import { DOM, WINDOW } from "./const";

import { $Node } from "./node/index";
import "./node/get";
import "./node/set";
import "./node/find";
import "./node/contains";
import "./node/clone";
import "./node/matches";

import { $NewDocument } from "./document/index";
import "./document/importscripts";
import "./document/importstyles";
import "./document/create";
import "./document/extend";
import "./document/mock";

import { $NewElement } from "./element/index";

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

    if (nodeType === 1) {
        return new $NewElement(node);
    } else if (nodeType === 9) {
        return new $NewDocument(node);
    } else {
        return new $Node();
    }
};

var _DOM = WINDOW.DOM;

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
