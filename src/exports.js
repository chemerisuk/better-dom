import { WINDOW } from "./constants";
import { DOM } from "./types";

var _DOM = WINDOW.DOM;

DOM.noConflict = function() {
    if (WINDOW.DOM === DOM) {
        WINDOW.DOM = _DOM;
    }

    return DOM;
};

// export better-dom to CommonJS environments
if (typeof exports !== "undefined") {
    exports.DOM = DOM;
} else {
    WINDOW.DOM = DOM;
}
