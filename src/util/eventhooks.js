import { JSCRIPT_VERSION, DOCUMENT } from "../const";

var hooks = {};
/* istanbul ignore if */
if ("onfocusin" in DOCUMENT.documentElement) {
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
    // fix non-bubbling form events for IE8 therefore
    // use custom event type instead of original one
    ["submit", "change", "reset"].forEach((name) => {
        hooks[name] = (handler) => { handler._type = "_" };
    });
}

export default hooks;
