import _ from "../util/index";
import { $Element } from "../types";
import { WINDOW, LEGACY_IE, WEBKIT_PREFIX, CUSTOM_EVENT_TYPE } from "../const";
import SelectorMatcher from "../util/selectormatcher";

var reRemovableMethod = /^(on|do)[A-Z]/,
    ANIMATION_ID = "DOM" + Date.now(),
    stopExt = (node, index) => (e) => {
        var isEventValid;

        e = e || WINDOW.event;

        if (LEGACY_IE) {
            isEventValid = e.srcUrn === CUSTOM_EVENT_TYPE && e.srcElement === node;
        } else {
            isEventValid = e.animationName === ANIMATION_ID && e.target === node;
        }
        // mark extension as processed via e._skip bitmask
        if (isEventValid) (e._skip = e._skip || {})[index] = true;
    },
    ExtensionHandler = (selector, condition, mixins, index) => {
        var eventHandlers = _.keys(mixins).filter((prop) => !!reRemovableMethod.exec(prop)),
            ctr = mixins.hasOwnProperty("constructor") && function(el) {
                try {
                    // make a safe call so live extensions can't break each other
                    mixins.constructor.call(el);
                } catch (err) {
                    // log invokation error if it was thrown
                    if ("console" in WINDOW) WINDOW.console.error(err);
                }
            },
            ext = (node, mock) => {
                var el = $Element(node);

                if (LEGACY_IE) {
                    node.attachEvent("on" + ExtensionHandler.EVENT_TYPE, stopExt(node, index));
                } else {
                    node.addEventListener(ExtensionHandler.EVENT_TYPE, stopExt(node, index), false);
                }

                if (mock === true || condition(el) !== false) {
                    _.assign(el, mixins);
                    // invoke constructor if it exists
                    if (ctr) ctr(el);
                    // remove event handlers from element's interface
                    if (mock !== true) eventHandlers.forEach((prop) => { delete el[prop] });
                }
            };

        ext.accept = SelectorMatcher(selector);

        return ext;
    };

if (LEGACY_IE) {
    ExtensionHandler.EVENT_TYPE = CUSTOM_EVENT_TYPE;
} else {
    ExtensionHandler.ANIMATION_ID = ANIMATION_ID;
    ExtensionHandler.EVENT_TYPE = WEBKIT_PREFIX ? "webkitAnimationEnd" : "animationend";
}

ExtensionHandler.traverse = (node, skip) => (ext, index) => {
    // skip previously excluded or mismatched elements
    if (!skip[index] && ext.accept(node)) ext(node);
};

export default ExtensionHandler;
