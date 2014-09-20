import { WINDOW } from "./const";
import { DOM } from "./types";

var _DOM = WINDOW.DOM;

DOM.noConflict = function() {
    if (WINDOW.DOM === DOM) {
        WINDOW.DOM = _DOM;
    }

    return DOM;
};

WINDOW.DOM = DOM;
