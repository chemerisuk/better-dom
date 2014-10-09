import _ from "../util/index";
import { $Element } from "../types";
import { WINDOW, LEGACY_IE, WEBKIT_PREFIX, CUSTOM_EVENT_TYPE } from "../const";
import SelectorMatcher from "../util/selectormatcher";

var rePrivateFunction = /^(?:on|do)[A-Z]/,
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
        var privateFunctions = _.keys(mixins).filter((prop) => !!rePrivateFunction.exec(prop)),
            ctr = mixins.hasOwnProperty("constructor") && mixins.constructor,
            ext = (node, mock) => {
                var el = $Element(node);

                if (LEGACY_IE) {
                    node.attachEvent("on" + ExtensionHandler.EVENT_TYPE, stopExt(node, index));
                } else {
                    node.addEventListener(ExtensionHandler.EVENT_TYPE, stopExt(node, index), false);
                }

                if (mock === true || condition(el) !== false) {
                    // apply all private/public members to the interface
                    _.assign(el, mixins);
                    // preserve this for private functions
                    privateFunctions.forEach((prop) => {
                        var fn = el[prop];

                        el[prop] = () => fn.apply(el, arguments);
                    });
                    // invoke constructor if it exists
                    // make a safe call so live extensions can't break each other
                    if (ctr) _.safeInvoke(el, ctr);
                    // remove event handlers from element's interface
                    privateFunctions.forEach((prop) => {
                        if (mock !== true) delete el[prop];
                    });
                }
            };

        ext.accept = SelectorMatcher(selector);

        if (ctr) delete mixins.constructor;

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
