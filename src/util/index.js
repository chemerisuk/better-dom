import { WINDOW } from "../const";
import { $Element, $NullElement } from "../types";

var arrayProto = Array.prototype;

export default {
    computeStyle: (node) => {
        /* istanbul ignore else */
        if (WINDOW.getComputedStyle) {
            return WINDOW.getComputedStyle(node);
        } else {
            return node.currentStyle;
        }
    },
    injectElement: (el) => {
        if (el && el.nodeType === 1) {
            return el.ownerDocument.getElementsByTagName("head")[0].appendChild(el);
        }
    },
    // utilites
    every: arrayProto.every,
    each: arrayProto.forEach,
    filter: arrayProto.filter,
    map: arrayProto.map,
    slice: arrayProto.slice,
    isArray: Array.isArray,
    keys: Object.keys,
    safeInvoke: (context, fn, arg1, arg2) => {
        if (typeof fn === "string") fn = context[fn];

        try {
            return fn.call(context, arg1, arg2);
        } catch (err) {
            /* istanbul ignore next */
            WINDOW.setTimeout(() => { throw err }, 1);

            return false;
        }
    },
    register(mixins, defaultBehavior) {
        defaultBehavior = defaultBehavior || function() {};

        Object.keys(mixins).forEach((key) => {
            var defaults = defaultBehavior(key) || function() { return this };

            $Element.prototype[key] = mixins[key];
            $NullElement.prototype[key] = defaults;
        });
    }
};
