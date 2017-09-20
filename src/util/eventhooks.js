import { HTML, DOCUMENT } from "../const";

var hooks = {};
/* istanbul ignore if */
if ("onfocusin" in HTML) {
    hooks.focus = (handler) => { handler._type = "focusin" };
    hooks.blur = (handler) => { handler._type = "focusout" };
} else {
    // firefox doesn't support focusin/focusout events
    hooks.focus = hooks.blur = (handler) => {
        handler.options.capture = true;
    };
}
/* istanbul ignore else */
if (DOCUMENT.createElement("input").validity) {
    hooks.invalid = (handler) => {
        handler.options.capture = true;
    };
}

export default hooks;
