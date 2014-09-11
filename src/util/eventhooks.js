import { DOM2_EVENTS, HTML, DOCUMENT, CUSTOM_EVENT_TYPE } from "../constants";

var hooks = {};

if ("onfocusin" in HTML) {
    hooks.focus = (handler) => { handler._type = "focusin" };
    hooks.blur = (handler) => { handler._type = "focusout" };
} else {
    // firefox doesn't support focusin/focusout events
    hooks.focus = hooks.blur = (handler) => { handler.capturing = true };
}

if (DOCUMENT.createElement("input").validity) {
    hooks.invalid = (handler) => { handler.capturing = true };
}

if (!DOM2_EVENTS) {
    // fix non-bubbling form events for IE8
    ["submit", "change", "reset"].forEach((name) => {
        hooks[name] = (handler) => { handler._type = CUSTOM_EVENT_TYPE };
    });
}

export default hooks;
