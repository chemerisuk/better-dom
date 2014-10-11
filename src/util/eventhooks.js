import { JSCRIPT_VERSION, HTML, DOCUMENT, CUSTOM_EVENT_TYPE } from "../const";

var hooks = {};
/* istanbul ignore if */
if ("onfocusin" in HTML) {
    hooks.focus = (handler) => { handler._type = "focusin" };
    hooks.blur = (handler) => { handler._type = "focusout" };
} else {
    // firefox doesn't support focusin/focusout events
    hooks.focus = hooks.blur = (handler) => { handler.capturing = true };
}
/* istanbul ignore else */
if (DOCUMENT.createElement("input").validity) {
    hooks.invalid = (handler) => { handler.capturing = true };
}
/* istanbul ignore if */
if (JSCRIPT_VERSION < 9) {
    // fix non-bubbling form events for IE8
    ["submit", "change", "reset"].forEach((name) => {
        hooks[name] = (handler) => { handler._type = CUSTOM_EVENT_TYPE };
    });
}

export default hooks;
