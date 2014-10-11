import { WINDOW, DOCUMENT } from "../const";

var arrayProto = Array.prototype,
    head = DOCUMENT.getElementsByTagName("head")[0];

export default {
    computeStyle: (node) => {
        return WINDOW.getComputedStyle ? WINDOW.getComputedStyle(node) : node.currentStyle;
    },
    injectElement: (el) => {
        return head.appendChild(el);
    },
    // utilites
    every: arrayProto.every,
    each: arrayProto.forEach,
    filter: arrayProto.filter,
    map: arrayProto.map,
    slice: arrayProto.slice,
    isArray: Array.isArray,
    keys: Object.keys,
    assign: (target, source) => {
        Object.keys(source).forEach((key) => {
            target[key] = source[key];
        });

        return target;
    },
    safeInvoke: (context, fn, arg1, arg2) => {
        if (typeof fn === "string") fn = context[fn];

        try {
            return fn.call(context, arg1, arg2);
        } catch (err) {
            /* istanbul ignore next */
            WINDOW.setTimeout(() => { throw err }, 1);

            return false;
        }
    }
};
